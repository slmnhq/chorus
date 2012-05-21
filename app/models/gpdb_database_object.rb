class GpdbDatabaseObject < ActiveRecord::Base
  belongs_to :schema, :class_name => 'GpdbSchema'

  DATABASE_OBJECTS_SQL = <<-SQL
    SELECT
      c.relkind AS type,
      c.relname AS name,
      d.description AS comment
    FROM
      pg_catalog.pg_class c
    LEFT JOIN
      pg_description d
      ON c.oid=d.objoid
    WHERE
      c.relkind IN ('r', 'v')
      AND c.relnamespace IN (SELECT oid FROM pg_catalog.pg_namespace WHERE nspname = ?)
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
    db_objects = Gpdb::ConnectionBuilder.connect!(account.instance, account, schema.database.name) do |conn|
      conn.query(sanitize_sql([DATABASE_OBJECTS_SQL, schema.name]))
    end

    db_object_names = db_objects.map { |_, name, _| name }
    schema.database_objects.where("gpdb_database_objects.name NOT IN (?)", db_object_names).destroy_all

    db_objects.map do |type, name, comment|
      klass = type == 'r' ? GpdbTable : GpdbView
      db_object = klass.find_or_create_by_name(name)
      db_object.schema = schema
      db_object.comment = comment
      db_object.save!
      db_object
    end
  end
end
