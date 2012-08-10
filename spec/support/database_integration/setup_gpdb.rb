require "tempfile"

module GpdbIntegration
  config_file = "test_gpdb_connection_config.yml"
  host_name   = ENV['GPDB_HOST'] || 'chorus-gpdb42'

  CONFIG          = YAML.load_file(File.expand_path("../#{config_file}", __FILE__))
  INSTANCE_CONFIG = CONFIG['instances'].find { |hash| hash["host"] == host_name }
  ACCOUNT_CONFIG  = INSTANCE_CONFIG['account']

  def self.execute_sql(sql_file)
    sql_read = File.read(File.expand_path("../#{sql_file}", __FILE__))

    sql = sql_read.gsub('gpdb_test_database', GpdbIntegration.database_name)

    connection_params = [
        "-U #{ACCOUNT_CONFIG['db_username']}",
        "-h #{INSTANCE_CONFIG['host']}",
        "-p #{INSTANCE_CONFIG['port']}"
    ].join(" ")

    Tempfile.open("setup_gpdb") do |f|
      f.write(sql)
      f.flush

      # silence stdout, remove hints and notices warnings from stderr
      filter_stderr = "2>&1 1>/dev/null | egrep -v \"NOTICE|HINT\" 1>&2"

      system "PGPASSWORD=#{ACCOUNT_CONFIG['db_password']} psql #{INSTANCE_CONFIG['maintenance_db']} #{connection_params} < #{f.path} #{filter_stderr}"
    end
  end

  def self.setup_gpdb
    execute_sql("setup_gpdb.sql")
  end

  def self.drop_gpdb
    execute_sql("drop_gpdb.sql")
  end

  def self.database_name
    "gpdb_" + Socket.gethostname
  end

  def self.instance_config_for_gpdb(name)
    config = CONFIG['instances'].find { |hash| hash["host"] == name }
    config.reject { |k,v| k == "account"}
  end

  def self.account_config_for_gpdb(name)
    config = CONFIG['instances'].find { |hash| hash["host"] == name }
    config["account"]
  end

  def refresh_chorus
    account = GpdbIntegration.real_gpdb_account
    GpdbDatabase.refresh(account)
    database = GpdbDatabase.find_by_name(GpdbIntegration.database_name)

    if !database
      GpdbIntegration.setup_gpdb
      GpdbDatabase.refresh(account)
      database = GpdbDatabase.find_by_name(GpdbIntegration.database_name)
    end

    GpdbSchema.refresh(account, database)
    gpdb_schema = database.schemas.find_by_name('test_schema')
    Dataset.refresh(account, gpdb_schema)
    database = GpdbDatabase.find_by_name("#{GpdbIntegration.database_name}_no_public_schema")
    GpdbSchema.refresh(account, database)
    gpdb_schema = database.schemas.find_by_name('non_public_schema')
    Dataset.refresh(account, gpdb_schema)

    account
  end

  def self.real_gpdb_account
    instance = GpdbIntegration.real_gpdb_instance
    instance.owner_account
  end

  def self.real_gpdb_instance
    host_name   = ENV['GPDB_HOST'] || 'chorus-gpdb42'
    Instance.find_by_name(host_name.gsub("-", "_"))
  end
end

