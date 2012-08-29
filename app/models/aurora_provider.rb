require 'aurora/service'

class AuroraProvider
  DEFAULT_PORT = 5432
  MAINTENANCE_DB = "postgres"

  attr_accessor :aurora_service

  def self.create_from_aurora_service
    config = Aurora::Config.new
    config.load(Chorus::Application.config.chorus['aurora'] || {})
    new(Aurora::Service.new(config))
  end

  def initialize(aurora_service)
    self.aurora_service = aurora_service
  end

  def valid?
    aurora_service.valid?
  end

  def templates
    aurora_service.templates
  end

  def self.provide!(instance_id, attributes = {})
    gpdb_instance = GpdbInstance.find(instance_id)
    provider = create_from_aurora_service

    db_attributes = attributes.dup.symbolize_keys!
    db_attributes.merge!({
      :template => provider.aurora_service.find_template_by_name(attributes["template"]),
      :db_username => gpdb_instance.owner_account.db_username,
      :db_password => gpdb_instance.owner_account.db_password
    })
    db = provider.aurora_service.create_database(db_attributes)
    gpdb_instance.host = db.public_ip
    gpdb_instance.save!
    Events::ProvisioningSuccess.by(gpdb_instance.owner).add(:greenplum_instance => gpdb_instance)
    schema_name =  attributes["schema_name"]
    if schema_name != 'public'
      create_new_schema(gpdb_instance.owner_account, attributes["database_name"], schema_name);
    end
    gpdb_instance.refresh_databases
    gpdb_instance

  rescue StandardError => e
    gpdb_instance = GpdbInstance.find(instance_id)
    gpdb_instance.state = 'fault'
    gpdb_instance.save!
    Events::ProvisioningFail.by(gpdb_instance.owner).add(:greenplum_instance => gpdb_instance,
                                                       :error_message => e.message)
  end

  private
  def self.create_new_schema(account, database_name, schema_name)
    Gpdb::ConnectionBuilder.connect!(account.gpdb_instance, account, database_name ) do |conn|
      conn.exec_query("CREATE SCHEMA #{schema_name}")
    end
  end
end