module Gpdb
  class InstanceStatus
    def self.check
      instances = Instance.scoped
      instances.each do |instance|
        instance.state = ConnectionBuilder.test_connection(instance) ? "online" : "offline"
        instance.save!
      end
    end
  end
end