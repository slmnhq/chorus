module Hdfs
  class InstanceRegistrar
    def self.create!(connection_config, owner)
      instance = HadoopInstance.new(connection_config)
      instance.owner = owner
      instance.version = Hdfs::QueryService.instance_version(instance)
      instance.save!
      Event::INSTANCE_CREATED.add(owner, instance)
      instance
    end

    def self.update!(instance_id, connection_config)
      instance = HadoopInstance.find(instance_id)
      instance.version = Hdfs::QueryService.instance_version(instance)
      instance.update_attributes(connection_config.except(:version))
      instance.save!
      instance
    end
  end
end
