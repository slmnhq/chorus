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

  SCHEMA_FUNCTION_QUERY = <<-SQL
      SELECT t1.oid, t1.proname, t1.lanname, t1.rettype, t1.proargnames, ARRAY_AGG(t2.typname ORDER BY inputtypeid) AS proargtypes
      FROM ( SELECT p.oid,p.proname,
                CASE WHEN p.proargtypes='' THEN NULL
                    ELSE unnest(p.proargtypes)
                    END as inputtype,
                now() AS inputtypeid, p.proargnames, l.lanname, t.typname AS rettype
              FROM pg_proc p, pg_namespace n, pg_type t, pg_language l
              WHERE p.pronamespace=n.oid
                AND p.prolang=l.oid
                AND p.prorettype = t.oid
                AND n.nspname= '%s') AS t1
      LEFT JOIN pg_type AS t2
      ON t1.inputtype=t2.oid
      GROUP BY t1.oid, t1.proname, t1.lanname, t1.rettype, t1.proargnames
      ORDER BY t1.proname
    SQL

  belongs_to :workspace
  belongs_to :database, :class_name => 'GpdbDatabase'
  has_many :datasets, :foreign_key => :schema_id
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
        Dataset.refresh(account, schema)
      end
      schema
    end
  end


  def stored_functions(account)
    results = database.with_gpdb_connection(account) do |conn|
      conn.query(SCHEMA_FUNCTION_QUERY % [name])
    end

    results.map do |result|
      GpdbSchemaFunction.new(*result[1..5])
    end
  end

  def with_gpdb_connection(account)
    database.with_gpdb_connection(account) do |conn|
      conn.schema_search_path = "#{conn.quote_column_name(name)}, 'public'"
      yield conn
    end
  end
end
