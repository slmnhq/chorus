require "tempfile"

SQL_FILE    = "setup_gpdb.sql"
CONFIG_FILE = "test_gpdb_connection_config.yml"
SQL         = File.read(File.expand_path("../#{SQL_FILE}", __FILE__))
CONFIG      = YAML.load_file(File.expand_path("../#{CONFIG_FILE}", __FILE__))

# silence stdout, remove hints and notices warnings from stderr
FILTER_STDERR = "2>&1 1>/dev/null | egrep -v \"NOTICE|HINT\" 1>&2"

module GpdbIntegration
  def self.setup_gpdb
    sql = SQL.gsub('gpdb_test_database', database_name)
    instance = CONFIG['instance']
    account  = CONFIG['account']

    connection_params = [
      "-U #{account['db_username']}",
      "-h #{instance['host']}",
      "-p #{instance['port']}"
    ].join(" ")

    Tempfile.open("setup_gpdb") do |f|
      f.write(sql)
      f.flush
      system "PGPASSWORD=#{account['db_password']} psql #{instance['maintenance_db']} #{connection_params} < #{f.path} #{FILTER_STDERR}"
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
    gpdb_schema = GpdbSchema.find_by_name('gpdb_test_schema')
    Dataset.refresh(account, gpdb_schema)
    database = GpdbDatabase.find_by_name("#{GpdbIntegration.database_name}_without_public_schema")
    GpdbSchema.refresh(account, database)
    gpdb_schema = GpdbSchema.find_by_name('gpdb_test_schema_in_db_without_public_schema')
    Dataset.refresh(account, gpdb_schema)
    account
  end

  def real_gpdb_account
    instance = FactoryGirl.create(:instance, CONFIG['instance'])
    account = FactoryGirl.create(:instance_account, CONFIG['account'].merge(:instance => instance))
  end
end

