module Gpdb
  class Instance
    include ActiveModel::Validations

    validates_presence_of :name, :host, :port, :database
    validates_presence_of :username, :password
    validate :connection_must_be_established

    attr_reader :name, :host, :port, :database
    attr_reader :username, :password
    attr_reader :owner
    attr_reader :cached_instance

    def self.create!(instance_config, owner)
      instance = new(instance_config, owner)
      unless instance.valid?
        raise ActiveRecord::RecordInvalid.new(instance)
      end
      instance.cache!
      instance
    end

    def self.create_cache!(instance_config, owner)
      create!(instance_config, owner).cached_instance
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

    def connection_must_be_established
      connection.verify_connection!
    rescue ConnectionError => e
      errors.add(:connection, e.message)
    end

    def cache!
      @cached_instance = owner.instances.create!(
          :name => name,
          :host => host,
          :port => port,
          :maintenance_db => database
      )
      cached_credentials = @cached_instance.credentials.build(
          :username => username,
          :password => password
      )
      cached_credentials.owner = owner
      cached_credentials.save!
      @cached_instance
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