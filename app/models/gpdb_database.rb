class GpdbDatabase < ActiveRecord::Base
  belongs_to :instance
  has_many :schemas, :class_name => 'GpdbSchema', :foreign_key => :database_id

  DATABASE_NAMES_SQL = <<-SQL
  SELECT
    datname
  FROM
    pg_database
  WHERE
    datallowconn IS TRUE
  SQL

  def self.refresh(account)
    instance = account.instance
    db_names = Gpdb::ConnectionBuilder.connect!(instance, account) do |conn|
      conn.query(DATABASE_NAMES_SQL)
    end.map { |row| row[0] }

    instance.databases.where("gpdb_databases.name NOT IN (?)", db_names).destroy_all

    db_names.map do |name|
      instance.databases.find_or_create_by_name!(name)
    end
  end

  def with_gpdb_connection(account, &block)
    Gpdb::ConnectionBuilder.connect!(account.instance, account, name, &block)
  end
end
