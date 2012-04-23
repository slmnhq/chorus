module Gpdb
  # Heavily inspired by ActiveRecord::Base::ConnectionSpecification
  class Connection
    # Heavily inspired by ActiveRecord::ConnectionAdapters::ConnectionHandler,
    # but avoiding ActiveRecord's mechanism for looking up a class hierarchy
    # for a connection.
    # May eventually need more methods from that class.
    class ConnectionHandler
      def initialize
        @name_to_pool = {}
      end

      def establish_connection(name, spec)
        @name_to_pool[name] ||= ActiveRecord::ConnectionAdapters::ConnectionPool.new(spec)
      end

      def retrieve_connection(name)
        pool = retrieve_connection_pool(name)
        (pool && pool.connection) or raise ConnectionNotEstablished
      end

      def retrieve_connection_pool(name)
        @name_to_pool[name]
      end
    end

    ##
    # :singleton-method:
    # The connection handler
    class_attribute :connection_handler, :instance_writer => false
    self.connection_handler = ConnectionHandler.new

    def initialize(connection_spec)
      @name = connection_spec.dup.delete(:name)
      spec = ActiveRecord::Base::ConnectionSpecification.new(connection_spec, 'postgresql_connection')

      self.class.connection_handler.establish_connection @name, spec
    end

    def connected?
      connection.schema_cache.tables
      true
    rescue PG::Error => e
      false
    end

    def connection
      self.class.connection_handler.retrieve_connection(@name)
    end
  end
end