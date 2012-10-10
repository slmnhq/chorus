module Gnip
  class InstanceRegistrar
    def self.create!(instance_attributes, owner)
      instance = GnipInstance.new(instance_attributes)
      instance.owner = owner
      instance.save!
      #Events::HadoopInstanceCreated.by(owner).add(:hadoop_instance => instance)
      instance
    end
  end
end
