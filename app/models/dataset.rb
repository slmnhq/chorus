class Dataset < ActiveRecord::Base
  belongs_to :schema, :class_name => 'GpdbSchema', :counter_cache => :datasets_count
  delegate :instance, :to => :schema
  delegate :definition, :to => :statistics
  validates_presence_of :name

  attr_accessor :statistics

  has_many :activities, :as => :entity
  has_many :events, :through => :activities
  has_many :associated_datasets
  has_many :bound_workspaces, :through => :associated_datasets, :source => :workspace

  scope :tables, where(:type => GpdbTable.name)
  scope :views, where(:type => GpdbView.name)

  delegate :with_gpdb_connection, :to => :schema
  delegate :instance, :to => :schema

  attr_accessor :highlighted_attributes, :search_result_comments
  searchable do
    text :name, :stored => true, :boost => SOLR_PRIMARY_FIELD_BOOST
    text :database_name, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    text :schema_name, :stored => true, :boost => SOLR_SECONDARY_FIELD_BOOST
    integer :instance_account_ids, :multiple => true do
      schema.database.instance_account_ids
    end
    string :grouping_id
    string :type_name
  end

  def self.search_permissions(current_user, search)
    search.build do
      any_of do
        without :type_name, Dataset.type_name
        account_ids = current_user.accessible_account_ids
        with :instance_account_ids, account_ids unless account_ids.blank?
      end
    end
  end

  def self.refresh(account, schema)
    datasets = schema.with_gpdb_connection(account, false) do |conn|
      conn.select_all(Query.new(schema).tables_and_views_in_schema.to_sql)
    end

    datasets.each do |attrs|
      type = attrs.delete('type')
      klass = type == 'r' ? GpdbTable : GpdbView
      dataset = klass.find_or_initialize_by_name_and_schema_id(attrs['name'], schema.id)
      dataset.update_attributes(attrs, :without_protection => true)
    end
  end

  def source_dataset_for(workspace)
    schema_id != workspace.sandbox_id
  end

  def add_metadata!(account)
    result = schema.with_gpdb_connection(account) do |conn|
      conn.select_all(Query.new(schema).metadata_for_dataset(name).to_sql)
    end.first
    @statistics = DatasetStatistics.new(result)
  end

  def self.with_name_like(name)
    if name.present?
      where("name ILIKE ?", "%#{name}%")
    else
      scoped
    end
  end

  def database_name
    schema.database.name
  end

  def schema_name
    schema.name
  end

  def type_name
    'Dataset'
  end

  class Query
    def initialize(schema)
      @schema = schema
    end

    attr_reader :schema

    VIEWS = Arel::Table.new("pg_views")
    SCHEMAS = Arel::Table.new("pg_namespace")
    RELATIONS = Arel::Table.new("pg_catalog.pg_class")
    PARTITIONS = Arel::Table.new("pg_partitions")
    PARTITION_RULE = Arel::Table.new("pg_partition_rule")
    DESCRIPTIONS = Arel::Table.new("pg_description")
    EXT_TABLES = Arel::Table.new("pg_exttable")
    LAST_OPERATION = Arel::Table.new("pg_stat_last_operation")

    DISK_SIZE = <<-SQL
    CASE WHEN position('''' in pg_catalog.pg_class.relname) > 0 THEN 'unknown'
         WHEN position('\\\\' in pg_catalog.pg_class.relname) > 0 THEN 'unknown'
         ELSE pg_size_pretty(pg_total_relation_size(pg_catalog.pg_class.oid))
    END
    SQL

    TABLE_TYPE = <<-SQL
    CASE WHEN pg_catalog.pg_class.relhassubclass = 't' THEN 'MASTER_TABLE'
         WHEN pg_exttable.location is NULL THEN 'BASE_TABLE'
         WHEN position('gphdfs' in pg_exttable.location[1]) > 0 THEN 'HD_EXT_TABLE'
         WHEN position('gpfdist' in pg_exttable.location[1]) > 0 THEN 'EXT_TABLE'
         ELSE 'EXT_TABLE'
    END
    SQL

    def relations_in_schema
      schema_ids = SCHEMAS.where(SCHEMAS[:nspname].eq(schema.name)).project(:oid)
      RELATIONS.where(RELATIONS[:relnamespace].in(schema_ids))
    end

    def tables_and_views_in_schema
      relations_in_schema.where(RELATIONS[:relkind].in(['r', 'v'])).
        join(PARTITION_RULE, Arel::Nodes::OuterJoin).
        on(
        RELATIONS[:oid].eq(PARTITION_RULE[:parchildrelid]).
          and(RELATIONS[:relhassubclass].eq('f'))
      ).
        where(
        RELATIONS[:relhassubclass].eq('t').or(PARTITION_RULE[:parchildrelid].eq(nil))
      ).project(
        RELATIONS[:relkind].as('type'),
        RELATIONS[:relname].as('name'),
        RELATIONS[:relhassubclass].as('master_table')
      )
    end

    def metadata_for_dataset(table_name)
      relations_in_schema.
        where(RELATIONS[:relname].eq(table_name)).
        join(DESCRIPTIONS, Arel::Nodes::OuterJoin).
        on(RELATIONS[:oid].eq(DESCRIPTIONS[:objoid])).
        join(VIEWS, Arel::Nodes::OuterJoin).
        on(VIEWS[:viewname].eq(RELATIONS[:relname])).
        join(LAST_OPERATION, Arel::Nodes::OuterJoin).
        on(
        LAST_OPERATION[:objid].eq(RELATIONS[:oid]).
          and(LAST_OPERATION[:staactionname].eq('ANALYZE'))
      ).
        join(EXT_TABLES, Arel::Nodes::OuterJoin).
        on(EXT_TABLES[:reloid].eq(RELATIONS[:oid])).
        project(
        (PARTITIONS.where(PARTITIONS[:schemaname].eq(schema.name).
                            and(PARTITIONS[:tablename].eq(table_name))).
          project(Arel.sql("*").count)
        ).as('partition_count'),
        RELATIONS[:reltuples].as('row_count'),
        RELATIONS[:relname].as('name'),
        DESCRIPTIONS[:description].as('description'),
        VIEWS[:definition].as('definition'),
        RELATIONS[:relnatts].as('column_count'),
        LAST_OPERATION[:statime].as('last_analyzed'),
        Arel.sql(DISK_SIZE).as('disk_size'),
        Arel.sql(TABLE_TYPE).as('table_type')
      )
    end
  end
end

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
