require 'fileutils'
require 'timeout'

class Gppipe < GpTableCopier
  ImportFailed = Class.new(StandardError)

  GPFDIST_DATA_DIR = Chorus::Application.config.chorus['gpfdist.data_dir']
  GPFDIST_WRITE_PORT = Chorus::Application.config.chorus['gpfdist.write_port']
  GPFDIST_READ_PORT = Chorus::Application.config.chorus['gpfdist.read_port']

  GPFDIST_TIMEOUT_SECONDS = 600
  GRACE_PERIOD = 5

  def self.timeout_seconds
    GPFDIST_TIMEOUT_SECONDS
  end

  def self.gpfdist_url
    Chorus::Application.config.chorus['gpfdist.url']
  end

  def self.protocol
    Chorus::Application.config.chorus['gpfdist.ssl'] ? 'gpfdists' : 'gpfdist'
  end

  def self.write_protocol
    self.protocol
  end

  def self.read_protocol
    self.protocol
  end

  def table_definition
    return @table_definition if @table_definition
    # No way of testing ordinal position clause since we can't reproduce an out of order result from the following query
    arr = src_conn.exec_query(describe_table)
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

  def write_pipe
    src_conn.exec_query("INSERT INTO \"#{source_schema.name}\".#{pipe_name}_w (SELECT * FROM #{source_table_fullname} #{limit_clause});")
  end

  def read_pipe
    dst_conn.exec_query("INSERT INTO #{destination_table_fullname} (SELECT * FROM \"#{destination_schema.name}\".#{pipe_name}_r);")
  end

  def run
    Timeout::timeout(Gppipe.timeout_seconds) do
      pipe_file = File.join(GPFDIST_DATA_DIR, pipe_name)
      no_rows_to_import = (src_conn.exec_query("SELECT count(*) from #{source_table_fullname};")[0]['count'] == 0) || row_limit == 0

      if create_new_table?
        dst_conn.exec_query("CREATE TABLE #{destination_table_fullname}(#{table_definition_with_keys}) #{distribution_key_clause}")
      elsif truncate?
        dst_conn.exec_query("TRUNCATE TABLE #{destination_table_fullname}")
      end
      unless no_rows_to_import
        begin
          system "mkfifo #{pipe_file}"
          src_conn.exec_query("CREATE WRITABLE EXTERNAL TABLE \"#{source_schema.name}\".#{pipe_name}_w (#{table_definition})
                                 LOCATION ('#{Gppipe.write_protocol}://#{Gppipe.gpfdist_url}:#{GPFDIST_WRITE_PORT}/#{pipe_name}') FORMAT 'TEXT';")
          dst_conn.exec_query("CREATE EXTERNAL TABLE \"#{destination_schema.name}\".#{pipe_name}_r (#{table_definition})
                               LOCATION ('#{Gppipe.read_protocol}://#{Gppipe.gpfdist_url}:#{GPFDIST_READ_PORT}/#{pipe_name}') FORMAT 'TEXT';")

          thr1 = Thread.new { write_pipe }
          thr2 = Thread.new { read_pipe }

          while(thr1.alive? || thr2.alive?)
            sleep(1)
            if(thr1.alive? && !thr2.alive?)
              sleep(GRACE_PERIOD)
              if(thr1.alive?)
                thr1.kill
                raise RuntimeError, "Gpfdist writer thread was hung, even through reader completed."
              end
            elsif(!thr1.alive? && thr2.alive?)
              sleep(GRACE_PERIOD)
              if(thr2.alive?)
                thr2.kill
                raise RuntimeError, "Gpfdist reader thread was hung, even through writer completed."
              end
            end
          end

          #collect any exceptions raised inside thread1 or thread2
          thr1.join
          thr2.join

        rescue Exception => e
          if create_new_table?
            dst_conn.exec_query("DROP TABLE IF EXISTS #{destination_table_fullname}")
          end
          raise ImportFailed, e.message
        ensure
          src_conn.exec_query("DROP EXTERNAL TABLE IF EXISTS \"#{source_schema.name}\".#{pipe_name}_w;")
          dst_conn.exec_query("DROP EXTERNAL TABLE IF EXISTS \"#{destination_schema.name}\".#{pipe_name}_r;")
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
        :host => source_schema.gpdb_instance.host,
        :port => source_schema.gpdb_instance.port,
        :database => source_schema.database.name,
        :username => source_account.db_username,
        :password => source_account.db_password,
        :adapter => "jdbcpostgresql"
    )
  end

  def dst_conn
    @raw_dst_conn ||= ActiveRecord::Base.postgresql_connection(
        :host => destination_schema.gpdb_instance.host,
        :port => destination_schema.gpdb_instance.port,
        :database => destination_schema.database.name,
        :username => destination_account.db_username,
        :password => destination_account.db_password,
        :adapter => "jdbcpostgresql"
    )
  end

  private

  def primary_key_sql
    <<-PRIMARYKEYSQL
      SELECT attname
      FROM   (SELECT *, generate_series(1, array_upper(conkey, 1)) AS rn
      FROM   pg_constraint where conrelid = '#{source_schema.name}.#{source_table.name}'::regclass and contype='p'
      ) y, pg_attribute WHERE attrelid = '#{source_schema.name}.#{source_table.name}'::regclass::oid AND conkey[rn] = attnum ORDER by rn;
    PRIMARYKEYSQL
  end

  def describe_table
    <<-DESCRIBETABLESQL
      SELECT a.attname as column_name,
        pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type,
        (SELECT substring(pg_catalog.pg_get_expr(d.adbin, d.adrelid) for 128)
         FROM pg_catalog.pg_attrdef d
         WHERE d.adrelid = a.attrelid
          AND d.adnum = a.attnum
          AND a.atthasdef),
        a.attnotnull, a.attnum,
        NULL AS attcollation
      FROM pg_catalog.pg_attribute a
      WHERE a.attrelid =
          (SELECT c.oid
          FROM pg_catalog.pg_class c
            LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          WHERE c.relname ~ '^(#{source_table.name})$'
            AND n.nspname ~ '^(#{source_schema.name})$')
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum;
    DESCRIBETABLESQL
  end

end
