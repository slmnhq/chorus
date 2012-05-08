class Schema

  attr_reader :name, :instance_id, :database_name

  def initialize name, instance_id, database_name
    @name = name
    @instance_id = instance_id
    @database_name = database_name
  end

  def self.from_instance_account_and_db instance_account, database_name
    conn = Gpdb::ConnectionBuilder.make_connection_with_database_name(
      instance_account.instance,
      instance_account,
      database_name
    )
    schema_rows = conn.query("select nspname from pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname NOT IN('information_schema','gp_toolkit', 'gpperfmon') ")
    schema_rows.map { |row| Schema.new(row[0], instance_account.instance_id, database_name) }
  end

  def to_param
    name
  end
end