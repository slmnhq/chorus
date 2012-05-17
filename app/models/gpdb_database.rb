class GpdbDatabase < ActiveRecord::Base
  belongs_to :instance
  has_many :schemas, :class_name => 'GpdbSchema', :foreign_key => :database_id

  DATABASE_NAMES_SQL = <<-SQL
  SELECT
    datname
  FROM
    pg_database
  SQL

  def self.refresh(account)
    db_names = Gpdb::ConnectionBuilder.connect!(account.instance, account) do |conn|
      conn.query(DATABASE_NAMES_SQL)
    end.map { |row| row[0] }

    account.instance.databases.where("gpdb_databases.name NOT IN (?)", db_names).destroy_all

    db_names.map do |name|
      account.instance.databases.find_or_create_by_name!(name)
    end
  end
end
