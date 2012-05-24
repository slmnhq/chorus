module Gpdb

  class InstanceRegistrar
    class InvalidInstanceError < RuntimeError
    end

    def self.create!(connection_config, owner)
      instance = owner.instances.build(connection_config.merge(:instance_provider => "Greenplum Database"))
      instance.shared = connection_config[:shared]

      account = owner.instance_accounts.build(connection_config)

      ActiveRecord::Base.transaction do
        instance.save!
        account.instance = instance
        ConnectionChecker.check!(instance, account)
        instance.save!
        account.save!
      end

      instance
    end

    def self.update!(instance, connection_config, updater)
      raise InvalidInstanceError if instance.nil?
      instance.attributes = connection_config

      ConnectionChecker.check!(instance, instance.owner_account)

      instance.save!
      instance
    end
  end
end
