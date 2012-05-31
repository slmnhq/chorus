class GpdbDatabaseObject < ActiveRecord::Base
  belongs_to :schema, :class_name => 'GpdbSchema', :counter_cache => :database_objects_count
  delegate :instance, :to => :schema

  validates_presence_of :name

  DATABASE_OBJECTS_SQL = <<-SQL
    SELECT
      c.relkind AS type,
      c.relname AS name,
      d.description AS comment,
      c.relhassubclass AS master_table,
      e.definition AS definition
    FROM
      pg_catalog.pg_class c
    LEFT JOIN
      pg_description d
      ON c.oid=d.objoid
    LEFT JOIN
      pg_catalog.pg_partitions p
      ON c.relname = p.partitiontablename AND p.schemaname = :schema AND c.relhassubclass = 'f'
    LEFT JOIN
      pg_views e
      ON c.relname=e.viewname AND e.schemaname = :schema
    WHERE
      c.relkind IN ('r', 'v') AND
      ((c.relhassubclass = 't') OR (c.relhassubclass = 'f' AND p.partitiontablename IS NULL))
      AND c.relnamespace IN (SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = :schema);
  SQL

  # From PostgresDBAccess.TableAndViewNamesQuery
  #     	sb.append("SELECT c.relname AS tableName, 'storage' AS storage, 'protocol' AS protocol, c.relkind AS type, c.relhassubclass AS masterTable , c.relnatts as columns ")
  #                .append(" FROM pg_catalog.pg_class c WHERE ")
  #                .append(" (c.relkind = 'r' OR c.relkind = 'v' )");
  #
  #    	if (schema != null) {
  #    		sb.append("AND c.relnamespace IN (SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = :schemaName) ");
  #    	}
  #
  #    	if (tableNamePattern != null) {
  #    		sb.append("AND c.relname ILIKE " + escapeSpecialCharacter(tableNamePattern));
  #    	}

  # From PostgresDBAccess.getViewMetaList
  #
  #"SELECT c.relname AS name, c.relnatts AS columnCount, d.description AS desc, v.definition as definition " +
  #"FROM pg_views v, pg_namespace n LEFT JOIN pg_class c ON (n.oid=c.relnamespace) " +
  #"LEFT JOIN pg_description d ON (c.oid=d.objoid) " +
  #"WHERE n.nspname= :schemaName AND c.relname IN (:viewNames) AND v.viewname = c.relname ORDER BY lower(c.relname)";

  # FROM PostgresDbAccess.getMultipleTableMeta
  #
  #"SELECT n.nspname as schemaName, c.relname AS name, d.description AS description " +
  #        "FROM pg_namespace n LEFT JOIN pg_class c ON (n.oid=c.relnamespace) " +
  #        "                    LEFT JOIN pg_description d ON (c.oid=d.objoid) " +
  #        "WHERE n.nspname= :schemaName AND c.relname IN (:names)";



  def self.refresh(account, schema)
    db_objects = schema.with_gpdb_connection(account) do |conn|
      conn.select_all(sanitize_sql([DATABASE_OBJECTS_SQL, :schema => schema.name]))
    end

    db_object_names = db_objects.map {|attrs| attrs['name']}
    schema.database_objects.where("gpdb_database_objects.name NOT IN (?)", db_object_names).destroy_all

    db_objects.each do |attrs|
      type = attrs.delete('type')
      klass = type == 'r' ? GpdbTable : GpdbView
      db_object = klass.find_or_initialize_by_name_and_schema_id(attrs['name'], schema.id)
      db_object.update_attributes(attrs, :without_protection => true)
    end
  end

  def self.with_name_like(name)
    if name.present?
      where("name ILIKE ?", "%#{name}%")
    else
      scoped
    end
  end
end
