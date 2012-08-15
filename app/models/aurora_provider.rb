require 'aurora/service'

class AuroraProvider
  DEFAULT_PORT = 5432
  MAINTENANCE_DB = "postgres"

  def self.create_from_aurora_service
    config = Aurora::Config.new
    config.load(Chorus::Application.config.chorus['aurora'])
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

  def provide!(attributes, owner)
    aurora_db = @aurora_service.create_database(aurora_attributes(attributes))
    Gpdb::InstanceRegistrar.create!(instance_attributes(attributes, aurora_db), owner)
  end

  private
  def aurora_attributes(attributes)
    aurora_attributes = attributes.slice(:size,
                                         :database_name,
                                         :db_username,
                                         :db_password)

    aurora_attributes[:template] = @aurora_service.find_template_by_name(attributes[:template])

    aurora_attributes
  end

  def instance_attributes(attributes, aurora_db)
    {
        :name => attributes[:name],
        :description => attributes[:description],
        :db_username => attributes[:db_username],
        :db_password => attributes[:db_password],
        :port => DEFAULT_PORT,
        :host => aurora_db.public_ip,
        :maintenance_db => MAINTENANCE_DB,
        :provision_type => 'aurora'
    }
  end
end