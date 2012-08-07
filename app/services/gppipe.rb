require 'fileutils'

class Gppipe
  GPFDIST_PIPE_DIR = File.join(Rails.root, '/tmp/gpfdist/')

  attr_reader :source_table, :destination_table

  def initialize(source_table, destination_table)
    @source_table = source_table
    @destination_table = destination_table
  end

  def tabledef_from_query(arr)
    arr.map { |col_def| "#{col_def["column_name"]} #{col_def["data_type"]}" }.join(", ")
  end

  def pipe_name
    @pipe_name ||= "#{source_table}_#{destination_table}"
  end

  def run
    pipe_file = File.join(GPFDIST_PIPE_DIR, pipe_name)

    table_definition = gpdb1 do |conn|
      table_def_rows = conn.exec_query("SELECT column_name, data_type from information_schema.columns where table_name = '#{source_table}' and table_schema='new_schema';")
      tabledef_from_query(table_def_rows)
    end

    begin
      system "mkfifo #{pipe_file}"

      thr = Thread.new do
        gpdb1 do |conn|
          conn.exec_query("drop external table if exists new_schema.#{pipe_name};")
          conn.exec_query("CREATE WRITABLE EXTERNAL TABLE new_schema.#{pipe_name}(#{table_definition}) LOCATION ('gpfdist://gillette:8000/#{pipe_name}') FORMAT 'TEXT';")
          conn.exec_query("INSERT INTO new_schema.#{pipe_name} (SELECT * FROM new_schema.#{source_table});")
          conn.exec_query("DROP EXTERNAL TABLE new_schema.#{pipe_name};")
        end
      end

      gpdb2 do |conn|
        conn.exec_query("drop external table if exists new_schema.#{pipe_name};")
        conn.exec_query("CREATE EXTERNAL TABLE new_schema.#{pipe_name}(#{table_definition}) LOCATION ('gpfdist://gillette:8001/#{pipe_name}') FORMAT 'TEXT';")
        conn.exec_query("CREATE TABLE new_schema.#{destination_table}(#{table_definition})")
        conn.exec_query("INSERT INTO new_schema.#{destination_table} (SELECT * FROM new_schema.#{pipe_name});")
        conn.exec_query("DROP EXTERNAL TABLE new_schema.#{pipe_name};")
      end

      thr.join
    ensure
      FileUtils.rm pipe_file if File.exists? pipe_file
    end
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
    yield connection if block_given?
  rescue ActiveRecord::JDBCError => e
    raise e, friendly_message
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
    yield connection if block_given?
  rescue ActiveRecord::JDBCError => e
    raise e, friendly_message
  ensure
    connection.try(:disconnect!)
  end
end
