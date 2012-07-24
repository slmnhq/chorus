require 'java'

Dir[File.expand_path(File.dirname(__FILE__) + '/jars') + '/*'].each do |jar|
  require jar
end

module Aurora
  module Java
    AuroraService = com.vmware.aurora.service.AuroraService
    AuroraConfig = com.vmware.aurora.client.common.config.AuroraConfig
    AuroraDBTemplate = com.vmware.aurora.model.DBTemplate
  end
end
