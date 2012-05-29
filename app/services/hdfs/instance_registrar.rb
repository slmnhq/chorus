module Hdfs
  class InstanceRegistrar
    def self.create!(connection_config, owner)
      instance = owner.hadoop_instances.build(connection_config)
      instance.version = Hdfs::QueryService.instance_version(instance)
      instance.save!
      instance
    end

    def self.update!(instance_id, connection_config, updater)
      # instance = Instance.find(instance_id)
      # raise SecurityTransgression unless updater.admin? || updater == instance.owner
      # instance.attributes = connection_config
      # ConnectionBuilder.check!(instance, instance.owner_account)
      # instance.save!
      # instance
    end
  end
end
