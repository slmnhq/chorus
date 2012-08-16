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
    instance = Instance.find(instance_id)
    provider = create_from_aurora_service

    db_attributes = attributes.merge({
      :template => provider.aurora_service.find_template_by_name(attributes[:template]),
      :db_username => instance.owner_account.db_username,
      :db_password => instance.owner_account.db_password
    })

    db = provider.aurora_service.create_database(db_attributes)
    instance.host = db.public_ip
    instance.save!
  end
end