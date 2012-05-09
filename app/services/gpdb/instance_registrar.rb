module Gpdb
  class InstanceRegistrar
    def self.create!(connection_config, owner)
      instance = owner.instances.build(connection_config.merge(:instance_provider => "Greenplum Database"))
      instance.shared = connection_config[:shared]

      account = owner.instance_accounts.build(connection_config)

      check_connection!(instance, account)

      ActiveRecord::Base.transaction do
        instance.save!
        account.instance = instance
        account.save!
      end

      instance
    end

    def self.update!(instance_id, connection_config, updater)
      instance = Instance.find(instance_id)
      raise SecurityTransgression unless updater.admin? || updater == instance.owner

      instance.attributes = connection_config

      check_connection!(instance, instance.owner_account)

      instance.save!
      instance
    end

    def self.check_connection!(instance, account)
      ConnectionBuilder.connect!(instance, account) {}
      instance.state = "online"
    rescue PG::Error => e
      errors = ApiValidationError.new
      errors.add(:connection, :generic, {:message => e.message})
      raise errors
    end
  end
end
