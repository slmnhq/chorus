class GpdbSchema < ActiveRecord::Base
  SCHEMAS_AND_DATASET_COUNT = <<-SQL
  SELECT
    schemas.nspname as schema_name,
    count(*) as dataset_count
  FROM
    pg_namespace schemas,
    pg_tables tables
  WHERE
    schemas.nspname NOT LIKE 'pg_%'
    AND schemas.nspname NOT IN('information_schema','gp_toolkit', 'gpperfmon')
    AND schemas.nspname = tables.schemaname
  GROUP BY
    schemas.nspname
  SQL
  
  belongs_to :database, :class_name => 'GpdbDatabase'
  attr_accessor :dataset_count

  def self.refresh(account, database)
    schema_rows = nil
    Gpdb::ConnectionBuilder.connect!(account.instance, account, database.name) do |conn|
      schema_rows = conn.query(SCHEMAS_AND_DATASET_COUNT)
    end

    schema_names = schema_rows.map { |row| row[0] }
    database.schemas.where("gpdb_schemas.name NOT IN (?)", schema_names).destroy_all

    schema_rows.map do |row| 
      schema = database.schemas.find_or_create_by_name(row[0])
      schema.dataset_count = row[1].to_i
      schema
    end
  end
end
