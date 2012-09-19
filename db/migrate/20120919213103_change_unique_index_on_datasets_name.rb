class ChangeUniqueIndexOnDatasetsName < ActiveRecord::Migration
  def up
    remove_index :datasets, [:name, :schema_id]
    execute "CREATE UNIQUE INDEX index_datasets_on_name_schema_id_and_type ON datasets ( name, schema_id, type ) WHERE deleted_at IS NULL"
  end

  def down
    execute "DROP INDEX index_datasets_on_name_schema_id_and_type"
    add_index :datasets, [:name, :schema_id], :unique => true
  end
end
