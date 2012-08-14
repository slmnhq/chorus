class AuroraProvider
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
end