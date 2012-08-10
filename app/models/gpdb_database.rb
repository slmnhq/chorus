class GpdbDatabase < ActiveRecord::Base
  include Stale

  belongs_to :instance
  has_many :schemas, :class_name => 'GpdbSchema', :foreign_key => :database_id
  has_and_belongs_to_many :instance_accounts
  delegate :account_for_user!, :to => :instance

  before_save :mark_schemas_as_stale

  DATABASE_NAMES_SQL = <<-SQL
  SELECT
    datname
  FROM
    pg_database
  WHERE
    datallowconn IS TRUE AND datname NOT IN ('postgres', 'template1')
  SQL

  def self.refresh(account)
    instance = account.instance
    db_names = Gpdb::ConnectionBuilder.connect!(instance, account) do |conn|
      conn.exec_query(DATABASE_NAMES_SQL)
    end.map { |row| row["datname"] }

    db_names.map do |name|
      db = instance.databases.find_or_create_by_name!(name)
      db.update_attributes!({:stale_at => nil}, :without_protection => true)
    end
  end

  def with_gpdb_connection(account, &block)
    Gpdb::ConnectionBuilder.connect!(account.instance, account, name, &block)
  end

  def find_dataset_in_schema(dataset_name, schema_name)
    schemas.find_by_name(schema_name).datasets.find_by_name(dataset_name)
  end

  private

  def mark_schemas_as_stale
    if stale? && stale_at_changed?
      schemas.each do |schema|
        schema.mark_stale!
      end
    end
  end
end
