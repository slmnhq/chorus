module Gpdb
  class InstanceRegistrar
    InvalidInstanceError = Class.new(StandardError)

    def self.create!(connection_config, owner, options = {})
      config = connection_config.merge(:instance_provider => "Greenplum Database")
      config.merge!(aurora_default_attributes) if options[:aurora]
      gpdb_instance = owner.gpdb_instances.build(config)
      gpdb_instance.shared = config[:shared]
      gpdb_instance.state = 'provisioning' if options[:aurora]

      account = owner.instance_accounts.build(config)
      ActiveRecord::Base.transaction do
        gpdb_instance.save!
        account.gpdb_instance = gpdb_instance
        ConnectionChecker.check!(gpdb_instance, account) unless options[:aurora]
        gpdb_instance.save!
        account.save!
      end

      Events::GreenplumInstanceCreated.by(owner).add(:greenplum_instance => gpdb_instance)

      gpdb_instance
    end

    def self.update!(gpdb_instance, connection_config, updater)
      raise InvalidInstanceError if gpdb_instance.nil?
      gpdb_instance.attributes = connection_config

      ConnectionChecker.check!(gpdb_instance, gpdb_instance.owner_account)

      if gpdb_instance.name_changed?
        Events::GreenplumInstanceChangedName.by(updater).add(
          :greenplum_instance => gpdb_instance,
          :old_name => gpdb_instance.name_was,
          :new_name => gpdb_instance.name
        )
      end

      gpdb_instance.save!
      gpdb_instance
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
