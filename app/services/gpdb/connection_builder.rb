module Gpdb
  class InstanceStillProvisioning < StandardError; end

  module ConnectionBuilder
    def self.connect!(gpdb_instance, account, database_name=nil)
      raise InstanceStillProvisioning if gpdb_instance.state == "provisioning"

      connection = ActiveRecord::Base.postgresql_connection(
        :host => gpdb_instance.host,
        :port => gpdb_instance.port,
        :database => database_name || gpdb_instance.maintenance_db,
        :username => account.db_username,
        :password => account.db_password,
        :adapter => "jdbcpostgresql"
      )
      yield connection if block_given?
    rescue ActiveRecord::JDBCError => e
      friendly_message = "#{Time.now.strftime("%Y-%m-%d %H:%M:%S")} ERROR: Failed to establish JDBC connection to #{gpdb_instance.host}:#{gpdb_instance.port}"
      Rails.logger.error(friendly_message + " - " + e.message)
      raise e
    rescue ActiveRecord::StatementInvalid => e
      friendly_message = "#{Time.now.strftime("%Y-%m-%d %H:%M:%S")} ERROR: SQL Statement Invalid"
      Rails.logger.info(friendly_message + " - " + e.message)
      raise e
    ensure
      connection.try(:disconnect!)
    end
  end
end
