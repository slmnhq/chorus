module LegacyMigrationHelper
  def mock_dataset_refresh
    any_instance_of(DatabaseMigrator) do |dm|
      stub(dm).migrate do
        ['dataset', 'gpdb_database', 'gpdb_schema'].each do |name|
          fixture_data = YAML.load(IO.read(Rails.root + "spec/other_fixtures/database_migration_refresh/#{name}.yml"))
          klass = name.classify.constantize
          fixture_data.each do |k, data|
            klass.connection.insert_fixture(data, klass.table_name)
          end
        end
        ids_to_replace = GpdbDatabase.connection.select_values("SELECT DISTINCT(instance_id) FROM gpdb_databases").collect(&:to_i).sort
        new_ids = Instance.all.collect(&:id).sort
        ids_to_replace.each_with_index do |id, index|
          GpdbDatabase.update_all({:instance_id => new_ids[index]}, "instance_id = #{id}")
        end
      end
    end
  end
end
