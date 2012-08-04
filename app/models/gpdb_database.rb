class GpdbDatabase < ActiveRecord::Base
  belongs_to :instance
  has_many :schemas, :class_name => 'GpdbSchema', :foreign_key => :database_id
  has_and_belongs_to_many :instance_accounts

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
      instance.databases.find_or_create_by_name!(name)
    end
  end

  def with_gpdb_connection(account, &block)
    Gpdb::ConnectionBuilder.connect!(account.instance, account, name, &block)
  end

  def stale?
    stale_at.present?
  end
end
