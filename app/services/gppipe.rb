require 'fileutils'
require 'timeout'

class Gppipe
  GPFDIST_DATA_DIR = Chorus::Application.config.chorus['gpfdist.data_dir']
  GPFDIST_URL = Chorus::Application.config.chorus['gpfdist.url']
  GPFDIST_WRITE_PORT = Chorus::Application.config.chorus['gpfdist.write_port']
  GPFDIST_READ_PORT = Chorus::Application.config.chorus['gpfdist.read_port']

  GPFDIST_TIMEOUT_SECONDS = 600

  def self.timeout_seconds
    GPFDIST_TIMEOUT_SECONDS
  end

  attr_reader :src_schema_name, :src_table, :dst_schema_name, :dst_table
  attr_reader :src_account, :dst_account
  attr_reader :src_instance, :dst_instance
  attr_reader :src_database_name, :dst_database_name
  attr_reader :row_limit

  def initialize(src_schema, src_table, dst_schema, dst_table, user, row_limit = nil)
    @src_schema_name = src_schema.name
    @src_database_name = src_schema.database.name
    @src_instance = src_schema.instance
    @src_account = src_instance.account_for_user!(user)
    @src_table = src_table
    @dst_schema_name = dst_schema.name
    @dst_database_name = dst_schema.database.name
    @dst_instance = dst_schema.instance
    @dst_account = dst_instance.account_for_user!(user)
    @dst_table = dst_table
    @row_limit = row_limit
  end

  def table_definition
    return @table_definition if @table_definition
    # No way of testing ordinal position clause since we can't reproduce an out of order result from the following query
    arr = src_conn.exec_query("SELECT column_name, data_type from information_schema.columns where table_name='#{src_table}' and table_schema='#{src_schema_name}' order by ordinal_position;")
    @table_definition = arr.map { |col_def| "\"#{col_def["column_name"]}\" #{col_def["data_type"]}" }.join(", ")
  end

  def table_definition_with_keys
    return @table_definition_with_keys if @table_definition_with_keys
    primary_key_row = src_conn.exec_query(primary_key_sql)[0]
    primary_key_clause = primary_key_row.nil? ? '' : ", PRIMARY KEY(\"#{primary_key_row['attname']}\")"
    @table_definition_with_keys = "#{table_definition}#{primary_key_clause}"
  end

  def limit_clause
    row_limit.nil? ? '' : "LIMIT #{row_limit}"
  end

  def pipe_name
    @pipe_name ||= "pipe_#{Process.pid}_#{Time.now.to_i}"
  end

  def dst_fullname
    @dst_fullname ||= "\"#{dst_schema_name}\".\"#{dst_table}\""
  end

  def src_fullname
    @src_fullname ||= "\"#{src_schema_name}\".\"#{src_table}\""
  end

  def run
    Timeout::timeout(Gppipe.timeout_seconds) do
      pipe_file = File.join(GPFDIST_DATA_DIR, pipe_name)
      no_rows_to_import = (src_conn.exec_query("SELECT count(*) from #{src_fullname};")[0]['count'] == 0) || row_limit == 0

      dst_conn.exec_query("CREATE TABLE #{dst_fullname}(#{table_definition_with_keys})")
      unless no_rows_to_import
        begin
          system "mkfifo #{pipe_file}"

          thr = Thread.new do
            src_conn.exec_query("CREATE WRITABLE EXTERNAL TABLE \"#{src_schema_name}\".#{pipe_name}_w (#{table_definition}) LOCATION ('gpfdist://#{GPFDIST_URL}:#{GPFDIST_WRITE_PORT}/#{pipe_name}') FORMAT 'TEXT';")
            src_conn.exec_query("INSERT INTO \"#{src_schema_name}\".#{pipe_name}_w (SELECT * FROM #{src_fullname} #{limit_clause});")
          end

          dst_conn.exec_query("CREATE EXTERNAL TABLE \"#{dst_schema_name}\".#{pipe_name}_r (#{table_definition}) LOCATION ('gpfdist://#{GPFDIST_URL}:#{GPFDIST_READ_PORT}/#{pipe_name}') FORMAT 'TEXT';")
          dst_conn.exec_query("INSERT INTO #{dst_fullname} (SELECT * FROM \"#{dst_schema_name}\".#{pipe_name}_r);")

          thr.join
        ensure
          src_conn.exec_query("DROP EXTERNAL TABLE IF EXISTS \"#{src_schema_name}\".#{pipe_name}_w;")
          dst_conn.exec_query("DROP EXTERNAL TABLE IF EXISTS \"#{dst_schema_name}\".#{pipe_name}_r;")
          FileUtils.rm pipe_file if File.exists? pipe_file
        end
      end
    end
  ensure
    disconnect_src_conn
    disconnect_dst_conn
  end

  def disconnect_src_conn
    src_conn.try(:disconnect!)
    @raw_src_conn = nil
  end

  def disconnect_dst_conn
    dst_conn.try(:disconnect!)
    @raw_dst_conn = nil
  end

  def src_conn
    @raw_src_conn ||= ActiveRecord::Base.postgresql_connection(
        :host => src_instance.host,
        :port => src_instance.port,
        :database => src_database_name,
        :username => src_account.db_username,
        :password => src_account.db_password,
        :adapter => "jdbcpostgresql"
    )
  end

  def dst_conn
    @raw_dst_conn ||= ActiveRecord::Base.postgresql_connection(
        :host => dst_instance.host,
        :port => dst_instance.port,
        :database => dst_database_name,
        :username => dst_account.db_username,
        :password => dst_account.db_password,
        :adapter => "jdbcpostgresql"
    )
  end

  private

  def primary_key_sql
    <<-PRIMARYKEYSQL
    SELECT
      pg_attribute.attname
    FROM pg_index, pg_class, pg_attribute
    WHERE
      pg_class.oid = '#{src_schema_name}.#{src_table}'::regclass AND
      indrelid = pg_class.oid AND
      pg_attribute.attrelid = pg_class.oid AND
      pg_attribute.attnum = any(pg_index.indkey)
      AND indisprimary;
    PRIMARYKEYSQL
  end
end
