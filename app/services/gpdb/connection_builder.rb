module Gpdb
  class ConnectionBuilder
    include ActiveModel::Validations

    validates_presence_of :name, :host, :port, :maintenance_db
    validates_presence_of :username, :password
    validate :connection_must_be_established

    attr_reader :name, :host, :port, :maintenance_db, :shared, :provision_type
    attr_reader :username, :password
    attr_reader :owner

    def self.create!(connection_config, owner)
      builder = new(connection_config, owner)
      builder.save!(owner)
      builder.instance
    end

    def self.update!(instance_id, connection_config, updater)
      instance = Instance.find(instance_id)
      raise SecurityTransgression unless updater.admin? || updater == instance.owner

      builder = for_update(connection_config, instance)
      builder.save!(updater)
      builder.instance
    end

    def self.for_update(connection_config, instance)
      new_owner = connection_config.delete(:owner) || instance.owner
      builder = new(connection_config, new_owner)
      builder.instance = instance
      builder.account = instance.owner_account
      builder
    end

    def initialize(attributes, owner)
      @name = attributes[:name]
      @host = attributes[:host]
      @port = attributes[:port]
      @maintenance_db = attributes[:maintenance_db]
      @username = attributes[:db_username]
      @password = attributes[:db_password]
      @owner = owner
      @provision_type = attributes[:provision_type]
      @shared = ActiveRecord::ConnectionAdapters::Column.value_to_boolean(attributes[:shared])
    end

    def save!(user)
      valid!
      Instance.transaction do
        save_instance!
        InstanceAccount.destroy_all("instance_id = #{instance.id} AND id != #{account.id}") if instance.shared
        save_account!(user)
        raise(ActiveRecord::RecordInvalid.new(self)) if !instance.shared && instance.owner_account.nil?
      end
    end

    def valid!
      unless valid?
        raise ActiveRecord::RecordInvalid.new(self)
      end
    end

    def connection_must_be_established
      @connection ||= connection
    end

    def instance
      @instance ||= owner.instances.build
    end

    attr_writer :instance

    def save_instance!
      instance.attributes = {
          :name => name,
          :host => host,
          :port => port,
          :maintenance_db => maintenance_db,
          :shared => shared,
          :provision_type => provision_type
      }
      instance.owner_id = owner.id
      instance.save!
    end

    def account
      @account ||= (
      account = instance.accounts.build
      account.owner = owner
      account
      )
    end

    attr_writer :account

    def save_account!(user)
      return unless user == account.owner

      account.attributes = {
          :username => username,
          :password => password,
      }
      account.owner_id = owner.id if shared
      account.save!
    end

    private

    def connection
      @connection ||= ActiveRecord::Base.postgresql_connection(
          :host => host,
          :port => port,
          :database => maintenance_db,
          :username => username,
          :password => password
      )
    rescue PG::Error => e
            errors.add(:connection, e.message)
            @connection = nil
    end
  end
end