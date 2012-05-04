module Gpdb
  class InstanceStatus
    def self.check
      instances = Instance.scoped
      instances.each do |instance|
        account = InstanceAccount.where(:owner_id => instance.owner_id).first
        instance.state = Gpdb::ConnectionBuilder.test_connection(instance, account) ? "online" : "offline"
        instance.save!
      end
    end
  end
end