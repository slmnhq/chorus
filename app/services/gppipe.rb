require 'fileutils'

class Gppipe
  GPFDIST_PIPE_DIR = File.join(Rails.root, '/tmp/gpfdist/')

  attr_reader :src_schema, :src_table, :dst_schema, :dst_table

  def initialize(src_schema, src_table, dst_schema, dst_table)
    @src_schema = src_schema
    @src_table = src_table
    @dst_schema = dst_schema
    @dst_table = dst_table
  end

  def tabledef_from_query(arr)
    arr.map { |col_def| "#{col_def["column_name"]} #{col_def["data_type"]}" }.join(", ")
  end

  def pipe_name
    @pipe_name ||= "pipe_#{Process.pid}_#{Time.now.to_i}"
  end

  def dst_fullname
    @dst_fullname ||= "\"#{dst_schema}\".\"#{dst_table}\""
  end

  def src_fullname
    @src_fullname ||= "\"#{src_schema}\".\"#{src_table}\""
  end

  def run
    pipe_file = File.join(GPFDIST_PIPE_DIR, pipe_name)
    empty_table = (conn1.exec_query("SELECT count(*) from #{src_fullname};")[0]['count'] == 0)
    table_def_rows = conn1.exec_query("SELECT column_name, data_type from information_schema.columns where table_name='#{src_table}' and table_schema='#{src_schema}';")
    table_definition = tabledef_from_query(table_def_rows)

    if empty_table
      conn2.exec_query("CREATE TABLE #{dst_fullname}(#{table_definition})")
    else
      begin
        system "mkfifo #{pipe_file}"
        conn2.exec_query("CREATE TABLE #{dst_fullname}(#{table_definition})")

        thr = Thread.new do
          conn1.exec_query("CREATE WRITABLE EXTERNAL TABLE \"#{src_schema}\".#{pipe_name}(#{table_definition}) LOCATION ('gpfdist://gillette:8000/#{pipe_name}') FORMAT 'TEXT';")
          conn1.exec_query("INSERT INTO \"#{src_schema}\".#{pipe_name} (SELECT * FROM #{src_fullname});")
        end

        conn2.exec_query("CREATE EXTERNAL TABLE \"#{dst_schema}\".#{pipe_name}(#{table_definition}) LOCATION ('gpfdist://gillette:8001/#{pipe_name}') FORMAT 'TEXT';")
        conn2.exec_query("INSERT INTO #{dst_fullname} (SELECT * FROM \"#{dst_schema}\".#{pipe_name});")

        thr.join
      ensure
        conn1.exec_query("DROP EXTERNAL TABLE IF EXISTS \"#{src_schema}\".#{pipe_name};")
        conn2.exec_query("DROP EXTERNAL TABLE IF EXISTS \"#{dst_schema}\".#{pipe_name};")
        FileUtils.rm pipe_file if File.exists? pipe_file
      end
    end
  ensure
    conn1.try(:disconnect!)
    conn2.try(:disconnect!)
  end

  def conn1
    @foo_gpdb1 ||= ActiveRecord::Base.postgresql_connection(
        :host => "chorus-gpdb42",
        :port => 5432,
        :database => "ChorusAnalytics",
        :username => "gpadmin",
        :password => "secret",
        :adapter => "jdbcpostgresql"
    )
  end

  def conn2
    @foo_gpdb2 ||= ActiveRecord::Base.postgresql_connection(
        :host => "chorus-gpdb41",
        :port => 5432,
        :database => "ChorusAnalytics",
        :username => "gpadmin",
        :password => "secret",
        :adapter => "jdbcpostgresql"
    )
  end

  def gpdb1
    connection = ActiveRecord::Base.postgresql_connection(
        :host => "chorus-gpdb42",
        :port => 5432,
        :database => "ChorusAnalytics",
        :username => "gpadmin",
        :password => "secret",
        :adapter => "jdbcpostgresql"
    )
    yield connection
  ensure
    connection.try(:disconnect!)
  end

  def gpdb2
    connection = ActiveRecord::Base.postgresql_connection(
        :host => "chorus-gpdb41",
        :port => 5432,
        :database => "ChorusAnalytics",
        :username => "gpadmin",
        :password => "secret",
        :adapter => "jdbcpostgresql"
    )
    yield connection
  ensure
    connection.try(:disconnect!)
  end
end
