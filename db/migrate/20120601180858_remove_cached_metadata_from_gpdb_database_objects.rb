class RemoveCachedMetadataFromGpdbDatabaseObjects < ActiveRecord::Migration
  def change
    remove_column :gpdb_database_objects, :comment
    remove_column :gpdb_database_objects, :definition
  end
end
