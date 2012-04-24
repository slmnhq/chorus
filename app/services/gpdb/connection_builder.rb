module Gpdb
  class ConnectionBuilder
    include ActiveModel::Validations

    validates_presence_of :name, :host, :port, :database
    validates_presence_of :username, :password
    validate :connection_must_be_established

    attr_reader :name, :host, :port, :database
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
      builder = new(connection_config, instance.owner)
      builder.instance = instance
      builder.credentials = instance.owner_credentials
      builder
    end

    def initialize(attributes, owner)
      @name = attributes[:name]
      @host = attributes[:host]
      @port = attributes[:port]
      @database = attributes[:database]
      @username = attributes[:username]
      @password = attributes[:password]
      @owner = owner
    end

    def save!(user)
      valid!
      save_instance!
      save_credentials!(user)
    end

    def valid!
      unless valid?
        raise ActiveRecord::RecordInvalid.new(self)
      end
    end

    def connection_must_be_established
      connection.verify_connection!
    rescue ConnectionError => e
      errors.add(:connection, e.message)
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
          :maintenance_db => database
      }
      instance.save!
    end

    def credentials
      @credentials ||= (
      credentials = instance.credentials.build
      credentials.owner = owner
      credentials
      )
    end

    attr_writer :credentials

    def save_credentials!(user)
      return unless user == credentials.owner

      credentials.attributes = {
          :username => username,
          :password => password
      }
      credentials.save!
    end

    private

    def connection
      @connection ||= Gpdb::Connection.new(
          :name => name,
          :host => host,
          :port => port,
          :database => database,
          :username => username,
          :password => password
      )
    end
  end
end