require 'aurora/service'

class AuroraProvider
  DEFAULT_PORT = 5432
  MAINTENANCE_DB = "postgres"

  def self.create_from_aurora_service
    config = Aurora::Config.new
    config.load(Chorus::Application.config.chorus['aurora'] || {})
    new(Aurora::Service.new(config))
  end

  def initialize(aurora_service)
    @aurora_service = aurora_service
  end

  def valid?
    @aurora_service.valid?
  end

  def templates
    @aurora_service.templates
  end

  def provide!(instance, attributes = {})
    db = @aurora_service.create_database(aurora_attributes(instance, attributes))
    instance.host = db.public_ip
  end

  private

  def aurora_attributes(instance, extra_attributes = {})
    extra_attributes.merge({
        :template => @aurora_service.find_template_by_name(extra_attributes[:template]),
        :db_username => instance.owner_account.db_username,
        :db_password => instance.owner_account.db_password
    })
  end
end