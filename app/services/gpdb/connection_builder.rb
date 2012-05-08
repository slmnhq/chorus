module Gpdb
  module ConnectionBuilder
    def self.with_connection(instance, account, database_name=nil)
      conn = ActiveRecord::Base.postgresql_connection(
        :host => instance.host,
        :port => instance.port,
        :database => database_name || instance.maintenance_db,
        :user => account.db_username,
        :password => account.db_password
      )
      return_value = yield conn
      conn.disconnect!
      return_value
    rescue PG::Error
      nil
    end
  end
end
