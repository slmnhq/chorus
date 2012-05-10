class Schema
  attr_reader :name, :instance_id, :database_name, :dataset_count

  def initialize name, instance_id, database_name, dataset_count
    @name = name
    @instance_id = instance_id
    @database_name = database_name
    @dataset_count = dataset_count
  end

  def self.from_instance_account_and_db instance_account, database_name
    schema_rows = nil
    Gpdb::ConnectionBuilder.connect!(instance_account.instance, instance_account, database_name) do |conn|
      schema_rows = conn.query("select count(*) as datasetCount ,nspname from pg_namespace n, pg_tables t WHERE nspname NOT LIKE 'pg_%' AND nspname NOT IN('information_schema','gp_toolkit', 'gpperfmon') and n.nspname = t.schemaname group by t.schemaname , n.nspname")
    end
    schema_rows.map { |row| Schema.new(row[1], instance_account.instance_id, database_name, row[0].to_i ) }
  end

  def to_param
    name
  end
end
