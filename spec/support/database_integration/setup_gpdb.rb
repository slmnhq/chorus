require "tempfile"

module GpdbIntegration
  sql_file    = "setup_gpdb.sql"
  config_file = "test_gpdb_connection_config.yml"
  host_name   = ENV['GPDB_HOST'] || 'chorus-gpdb42'

  SQL             = File.read(File.expand_path("../#{sql_file}", __FILE__))
  CONFIG          = YAML.load_file(File.expand_path("../#{config_file}", __FILE__))
  INSTANCE_CONFIG = CONFIG['instances'].find { |hash| hash["host"] == host_name }
  ACCOUNT_CONFIG  = INSTANCE_CONFIG['account']

  def self.setup_gpdb
    sql = SQL.gsub('gpdb_test_database', database_name)

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

  def self.database_name
    "gpdb_" + Socket.gethostname
  end

  def refresh_chorus
    account = real_gpdb_account
    GpdbDatabase.refresh(account)
    database = GpdbDatabase.find_by_name(GpdbIntegration.database_name)
    GpdbSchema.refresh(account, database)
    gpdb_schema = GpdbSchema.find_by_name('test_schema')
    Dataset.refresh(account, gpdb_schema)
    database = GpdbDatabase.find_by_name("#{GpdbIntegration.database_name}_no_public_schema")
    GpdbSchema.refresh(account, database)
    gpdb_schema = GpdbSchema.find_by_name('non_public_schema')
    Dataset.refresh(account, gpdb_schema)
    account
  end

  def real_gpdb_account
    instance = FactoryGirl.create(:instance, INSTANCE_CONFIG.except('account'))
    account = FactoryGirl.create(:instance_account, ACCOUNT_CONFIG.merge(:instance => instance))
  end
end

