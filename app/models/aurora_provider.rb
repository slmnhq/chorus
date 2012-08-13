class AuroraProvider
  def initialize(aurora_service)
    @aurora_service = aurora_service
  end
  def install_succeed?
    @aurora_service.provider_status == 'install_succeed'
  end
end