class GpdbDatabase < ActiveRecord::Base
  belongs_to :instance

  def self.refresh(account)
    db_rows = Gpdb::ConnectionBuilder.connect!(account.instance, account) do |conn|
      conn.query("select datname from pg_database order by upper(datname)")
    end

    db_rows.map do |row|
      account.instance.databases.find_or_create_by_name!(row[0])
    end
  end
end
