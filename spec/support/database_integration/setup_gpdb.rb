require "hashie/mash"
require "tempfile"
require "erubis"

config_file   = File.expand_path("../test_gpdb_connection_config.yml", __FILE__)
template_file = File.expand_path("../setup_gpdb.sql.erb", __FILE__)

CONFIG   = Hashie::Mash.new(YAML.load_file(config_file))
TEMPLATE = File.read(template_file)

module GpdbIntegration
  def setup_gpdb
    instance = CONFIG.instance
    account = CONFIG.account

    sql = Erubis::Eruby.new(TEMPLATE).result(CONFIG)

    connection_params = [
      "-U #{account.db_username}",
      "-h #{instance.host}",
      "-p #{instance.port}",
      "--no-password"
    ].join(" ")

    f = Tempfile.new("setup_gpdb")
    f.write(sql)
    f.close
    system "psql #{instance.maintenance_db} #{connection_params} < #{f.path}"
    f.unlink
  end

  def refresh_chorus
    account = real_gpdb_account
    GpdbDatabase.refresh(account)
    database = GpdbDatabase.find_by_name('gpdb_test_database')
    GpdbSchema.refresh(account, database)
    gpdb_schema = GpdbSchema.find_by_name('gpdb_test_schema')
    Dataset.refresh(account, gpdb_schema)
    database = GpdbDatabase.find_by_name('gpdb_test_database_without_public_schema')
    GpdbSchema.refresh(account, database)
    gpdb_schema = GpdbSchema.find_by_name('gpdb_test_schema_in_db_without_public_schema')
    Dataset.refresh(account, gpdb_schema)
  end

  def real_gpdb_account
    instance = FactoryGirl.create(:instance, CONFIG.instance.to_hash)
    account = FactoryGirl.create(:instance_account, CONFIG.account.to_hash.merge(:instance => instance))
  end
end

