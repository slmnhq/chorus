class CreateGpdbDatabaseObjectWorkspaceAssociations < ActiveRecord::Migration
  def change
    create_table :gpdb_database_object_workspace_associations do |t|
      t.integer :gpdb_database_object_id
      t.integer :workspace_id

      t.timestamps
    end

    add_index :gpdb_database_object_workspace_associations, [:gpdb_database_object_id, :workspace_id], :unique => true, :name => 'gpdb_db_object_workspace_unique'
  end
end
