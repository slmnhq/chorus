module Gpdb
  class InstanceStatus
    def self.check
      instances = Instance.scoped
      instances.each do |instance|
        account = InstanceAccount.where(:owner_id => instance.owner_id, :instance_id => instance.id).first
        instance.state = "offline"
        Gpdb::ConnectionBuilder.connect(instance, account) do |conn|
          instance.state = "online"
          version_string = conn.query("select version()")[0][0]

          # if the version string looks like this:
          # PostgreSQL 9.2.15 (Greenplum Database 4.1.1.2 build 2) on i386-apple-darwin9.8.0 ...
          # then we just want "4.1.1.2"

          instance.version = version_string.match(/Greenplum Database ([\d\.]*)/)[1]
        end
        instance.save!
      end
    end
  end
end
