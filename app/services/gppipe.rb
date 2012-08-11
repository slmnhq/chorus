require 'fileutils'
require 'timeout'

class Gppipe<GpTableCopier
  GPFDIST_DATA_DIR = Chorus::Application.config.chorus['gpfdist.data_dir']
  GPFDIST_WRITE_PORT = Chorus::Application.config.chorus['gpfdist.write_port']
  GPFDIST_READ_PORT = Chorus::Application.config.chorus['gpfdist.read_port']

  GPFDIST_TIMEOUT_SECONDS = 600

  def self.timeout_seconds
    GPFDIST_TIMEOUT_SECONDS
  end

  def self.gpfdist_url
    Chorus::Application.config.chorus['gpfdist.url']
  end

  def self.protocol
    Chorus::Application.config.chorus['gpfdist.ssl'] ? 'gpfdists' : 'gpfdist'
  end

  def table_definition
    return @table_definition if @table_definition
    # No way of testing ordinal position clause since we can't reproduce an out of order result from the following query
    arr = src_conn.exec_query("SELECT column_name, data_type from information_schema.columns where table_name='#{src_table_name}' and table_schema='#{src_schema.name}' order by ordinal_position;")
    @table_definition = arr.map { |col_def| "\"#{col_def["column_name"]}\" #{col_def["data_type"]}" }.join(", ")
  end

  def table_definition_with_keys
    return @table_definition_with_keys if @table_definition_with_keys
    primary_key_rows = src_conn.exec_query(primary_key_sql)
    primary_key_clause = primary_key_rows.empty? ? '' : ", PRIMARY KEY(#{quote_and_join(primary_key_rows)})"
    @table_definition_with_keys = "#{table_definition}#{primary_key_clause}"
  end

  def pipe_name
    @pipe_name ||= "pipe_#{Process.pid}_#{Time.now.to_i}"
  end

  def run
    Timeout::timeout(Gppipe.timeout_seconds) do
      pipe_file = File.join(GPFDIST_DATA_DIR, pipe_name)
      no_rows_to_import = (src_conn.exec_query("SELECT count(*) from #{src_fullname};")[0]['count'] == 0) || row_limit == 0

      dst_conn.exec_query("CREATE TABLE #{dst_fullname}(#{table_definition_with_keys}) #{distribution_key_clause}")
      unless no_rows_to_import
        begin
          system "mkfifo #{pipe_file}"

          thr = Thread.new do
            src_conn.exec_query("CREATE WRITABLE EXTERNAL TABLE \"#{src_schema.name}\".#{pipe_name}_w (#{table_definition})
                                 LOCATION ('#{Gppipe.protocol}://#{Gppipe.gpfdist_url}:#{GPFDIST_WRITE_PORT}/#{pipe_name}') FORMAT 'TEXT';")
            src_conn.exec_query("INSERT INTO \"#{src_schema.name}\".#{pipe_name}_w (SELECT * FROM #{src_fullname} #{limit_clause});")
          end

          dst_conn.exec_query("CREATE EXTERNAL TABLE \"#{dst_schema.name}\".#{pipe_name}_r (#{table_definition})
                               LOCATION ('#{Gppipe.protocol}://#{Gppipe.gpfdist_url}:#{GPFDIST_READ_PORT}/#{pipe_name}') FORMAT 'TEXT';")
          dst_conn.exec_query("INSERT INTO #{dst_fullname} (SELECT * FROM \"#{dst_schema.name}\".#{pipe_name}_r);")

          thr.join
        ensure
          src_conn.exec_query("DROP EXTERNAL TABLE IF EXISTS \"#{src_schema.name}\".#{pipe_name}_w;")
          dst_conn.exec_query("DROP EXTERNAL TABLE IF EXISTS \"#{dst_schema.name}\".#{pipe_name}_r;")
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
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(conkey, 1)) AS rn
      FROM   pg_constraint where conrelid = '#{src_schema.name}.#{src_table_name}'::regclass and contype='p'
      ) y, pg_attribute WHERE attrelid = '#{src_schema.name}.#{src_table_name}'::regclass::oid AND conkey[rn] = attnum ORDER by rn;
    PRIMARYKEYSQL
  end

end
