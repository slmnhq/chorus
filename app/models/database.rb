class Database
  def initialize name, instance_id
    @name = name
    @instance_id = instance_id
  end

  def name
    @name
  end

  def instance_id
    @instance_id
  end

  def self.from_instance_account account
    db_rows = Gpdb::ConnectionBuilder.connect!(account.instance, account) do |conn|
      conn.query("select datname from pg_database order by upper(datname)")
    end

    db_rows.map do |row|
      new row[0], account.instance_id
    end
  end
end
