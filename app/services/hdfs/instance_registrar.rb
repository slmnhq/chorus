module Hdfs
  class InstanceRegistrar
    def self.create!(connection_config, owner)
      instance = HadoopInstance.new(connection_config)
      instance.owner = owner
      instance.version = Hdfs::QueryService.instance_version(instance)
      instance.save!
      Events::HadoopInstanceCreated.by(owner).add(:hadoop_instance => instance)
      instance
    end

    def self.update!(instance_id, connection_config, updater)
      instance = HadoopInstance.find(instance_id)
      instance.version = Hdfs::QueryService.instance_version(instance)
      instance.attributes = connection_config.except(:version)

      if instance.name_changed?
        Events::HadoopInstanceChangedName.by(updater).add(
          :hadoop_instance => instance,
          :old_name => instance.name_was,
          :new_name => instance.name
        )
      end

      instance.save!
      instance
    end
  end
end
