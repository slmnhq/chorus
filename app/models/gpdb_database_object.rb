class GpdbDatabaseObject < ActiveRecord::Base
  belongs_to :schema, :class_name => 'GpdbSchema', :counter_cache => :database_objects_count
  delegate :instance, :to => :schema
  validates_presence_of :name

  attr_accessor :comment, :definition, :column_count

  delegate :with_gpdb_connection, :to => :schema

  def self.refresh(account, schema)
    db_objects = schema.with_gpdb_connection(account) do |conn|
      conn.select_all(Query.new(schema).tables_and_views_in_schema.to_sql)
    end

    db_object_names = db_objects.map {|attrs| attrs['name']}
    schema.database_objects.where("gpdb_database_objects.name NOT IN (?)", db_object_names).destroy_all

    db_objects.each do |attrs|
      type = attrs.delete('type')
      klass = type == 'r' ? GpdbTable : GpdbView
      db_object = klass.find_or_initialize_by_name_and_schema_id(attrs['name'], schema.id)
      db_object.update_attributes(aspec/database_integration/database_object_spec.rbttrs, :without_protection => true)
    end
  end

  def self.add_metadata!(db_objects, account)
    db_objects = db_objects.to_a
    return if db_objects.empty?

    schema = db_objects.first.schema
    names  = db_objects.map(&:name)
    result = schema.with_gpdb_connection(account) do |conn|
      conn.select_all(Query.new(schema).comments_for_tables(names).to_sql)
    end
    result.each do |hsh|
      db_objects.detect { |r| r.name == hsh["object_name"] }.comment = hsh["comment"]
    end
  end

  def self.with_name_like(name)
    if name.present?
      where("name ILIKE ?", "%#{name}%")
    else
      scoped
    end
  end

  class Query
    def initialize(schema)
      @schema = schema
    end

    attr_reader :schema

    SCHEMAS = Arel::Table.new("pg_namespace")
    RELATIONS = Arel::Table.new("pg_catalog.pg_class")
    PARTITIONS = Arel::Table.new("pg_partitions")
    DESCRIPTIONS = Arel::Table.new("pg_description")

    def relations_in_schema
      schema_ids = SCHEMAS.where(SCHEMAS[:nspname].eq(schema.name)).project(:oid)
      RELATIONS.where(RELATIONS[:relnamespace].in(schema_ids))
    end

    def tables_and_views_in_schema
      relations_in_schema.where(RELATIONS[:relkind].in(['r', 'v'])).
        join(PARTITIONS, Arel::Nodes::OuterJoin).
        on(
          RELATIONS[:relname].eq(PARTITIONS[:partitiontablename]).
          and(RELATIONS[:relhassubclass].eq('f')).
          and(PARTITIONS[:schemaname].eq(schema.name))
        ).
        where(
          RELATIONS[:relhassubclass].eq('t').or(PARTITIONS[:partitiontablename].eq(nil))
        ).project(
          RELATIONS[:relkind].as('type'),
          RELATIONS[:relname].as('name'),
          RELATIONS[:relhassubclass].as('master_table')
        )
    end

    def comments_for_tables(table_names)
      relations_in_schema.
        where(RELATIONS[:relname].in(table_names)).
        join(DESCRIPTIONS).
        on(RELATIONS[:oid].
        eq(DESCRIPTIONS[:objoid])).
        project(
          RELATIONS[:relname].as('object_name'),
          DESCRIPTIONS[:description].as('comment')
        )
    end
  end
end

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
