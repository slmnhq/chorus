class GpdbSchema < ActiveRecord::Base
  SCHEMAS_SQL = <<-SQL
  SELECT
    schemas.nspname as schema_name
  FROM
    pg_namespace schemas
  WHERE
    schemas.nspname NOT LIKE 'pg_%'
    AND schemas.nspname NOT IN ('information_schema', 'gp_toolkit', 'gpperfmon')
  SQL

  belongs_to :database, :class_name => 'GpdbDatabase'
  has_many :database_objects, :class_name => 'GpdbDatabaseObject', :foreign_key => :schema_id
  delegate :with_gpdb_connection, :to => :database
  delegate :instance, :to => :database

  def self.refresh(account, database)
    schema_rows = database.with_gpdb_connection(account) do |conn|
      conn.query(SCHEMAS_SQL)
    end

    schema_names = schema_rows.map { |row| row[0] }
    database.schemas.where("gpdb_schemas.name NOT IN (?)", schema_names).destroy_all

    schema_rows.map do |row| 
      schema = database.schemas.find_or_initialize_by_name(row[0])
      unless schema.persisted?
        schema.save!
        GpdbDatabaseObject.refresh(account, schema)
      end
      schema
    end
  end

  def with_gpdb_connection(account)
    database.with_gpdb_connection(account) do |conn|
      conn.schema_search_path = "#{conn.quote_column_name(name)}, 'public'"
      yield conn
    end
  end
end
