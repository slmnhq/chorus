module Hdfs
  class InstanceStatus
    def self.check
      HadoopInstance.scoped.each do |instance|
        instance.online = false
        version = Hdfs::QueryService.instance_version(instance)
        if version
          instance.version = version
          instance.online = true
        end
        instance.save!
      end
    end
  end
end
