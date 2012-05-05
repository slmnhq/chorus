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

  def self.from_instance_account instance_account
    db_rows = instance_account.make_connection.query("select datname from pg_database")
    db_rows.map do |row|
      new row[0], instance_account.instance_id
    end
  end
end