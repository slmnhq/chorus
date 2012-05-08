module Gpdb
  class InstanceStatus
    def self.check
      instances = Instance.scoped
      instances.each do |instance|
        account = InstanceAccount.where(:owner_id => instance.owner_id, :instance_id => instance.id).first
        instance.state = "offline"
        Gpdb::ConnectionBuilder.with_connection(instance, account) do |conn|
          instance.state = "online"
        end
        instance.save!
      end
    end
  end
end
