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

      Events::GREENPLUM_INSTANCE_CREATED.by(owner).add(:greenplum_instance => instance)

      instance
    end

    def self.update!(instance, connection_config, updater)
      raise InvalidInstanceError if instance.nil?
      instance.attributes = connection_config

      ConnectionChecker.check!(instance, instance.owner_account)

      if instance.name_changed?
        Events::GREENPLUM_INSTANCE_CHANGED_NAME.by(updater).add(
          :greenplum_instance => instance,
          :old_name => instance.name_was,
          :new_name => instance.name
        )
      end

      instance.save!
      instance
    end
  end
end
