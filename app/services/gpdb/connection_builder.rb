module Gpdb
  module ConnectionBuilder
    def self.connect!(instance, account, database_name=nil)
      connection = ActiveRecord::Base.postgresql_connection(
        :host => instance.host,
        :port => instance.port,
        :database => database_name || instance.maintenance_db,
        :user => account.db_username,
        :password => account.db_password
      )
      result = yield connection
      connection.disconnect!
      result
    end

    def self.connect(instance, account, database_name=nil, &block)
      connect!(instance, account, database_name, &block)
    rescue PG::Error
      nil
    end
  end
end
