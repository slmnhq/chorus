require 'aurora/service'

class AuroraProvider
  DEFAULT_PORT = 5432
  MAINTENANCE_DB = "postgres"

  def self.create_from_aurora_service
    config_path = Rails.root.join('config', 'aurora.properties')
    new(Aurora::Service.new(config_path))
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
    aurora_attributes = attributes.slice(:size,
                                         :database_name,
                                         :db_username,
                                         :db_password)

    aurora_attributes[:template] = @aurora_service.find_template_by_name(attributes[:template])

    aurora_db = @aurora_service.create_database(aurora_attributes)

    instance_attributes = {
      :name => attributes[:name],
      :description => attributes[:description],
      :db_username => attributes[:db_username],
      :db_password => attributes[:db_password],
      :port => DEFAULT_PORT,
      :host => aurora_db.public_ip,
      :maintenance_db => MAINTENANCE_DB,
      :provision_type => 'aurora'
    }

    Gpdb::InstanceRegistrar.create!(instance_attributes, owner)
  end
end