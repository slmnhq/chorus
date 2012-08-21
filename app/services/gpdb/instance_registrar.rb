module Gpdb
  class InstanceRegistrar
    InvalidInstanceError = Class.new(StandardError)

    def self.create!(connection_config, owner, options = {})
      config = connection_config.merge(:instance_provider => "Greenplum Database")
      config.merge!(aurora_default_attributes) if options[:aurora]
      instance = owner.instances.build(config)
      instance.shared = config[:shared]

      account = owner.instance_accounts.build(config)
      ActiveRecord::Base.transaction do
        instance.save!
        account.instance = instance
        ConnectionChecker.check!(instance, account) unless options[:aurora]
        instance.save!
        account.save!
      end

      Events::GreenplumInstanceCreated.by(owner).add(:greenplum_instance => instance)

      instance
    end

    def self.update!(instance, connection_config, updater)
      raise InvalidInstanceError if instance.nil?
      instance.attributes = connection_config

      ConnectionChecker.check!(instance, instance.owner_account)

      if instance.name_changed?
        Events::GreenplumInstanceChangedName.by(updater).add(
          :greenplum_instance => instance,
          :old_name => instance.name_was,
          :new_name => instance.name
        )
      end

      instance.save!
      instance
    end

    private

    def self.aurora_default_attributes
      {
          :port => AuroraProvider::DEFAULT_PORT,
          :host => "provisioning_ip",
          :maintenance_db => AuroraProvider::MAINTENANCE_DB,
          :provision_type => "create"
      }
    end

  end
end
