module Gpdb
  module ConnectionBuilder
    def self.connect!(instance, account, database_name=nil)
      connection = ActiveRecord::Base.postgresql_connection(
        :host => instance.host,
        :port => instance.port,
        :database => database_name || instance.maintenance_db,
        :username => account.db_username,
        :password => account.db_password,
        :adapter => "jdbcpostgresql"
      )
      yield connection if block_given?
    rescue ActiveRecord::JDBCError => e
      friendly_message = "Failed to establish JDBC connection to #{instance.host}:#{instance.port}"
      Rails.logger.error(friendly_message + " - " + e.message)
      raise e, friendly_message
    ensure
      connection.try(:disconnect!)
    end
  end
end
