class RenameGpdbDatabaseObjectToDataset < ActiveRecord::Migration
  def change
    rename_table :gpdb_database_objects, :datasets
    rename_column :associated_datasets, :gpdb_database_object_id, :dataset_id
    rename_column :gpdb_schemas, :database_objects_count, :datasets_count
  end
end
