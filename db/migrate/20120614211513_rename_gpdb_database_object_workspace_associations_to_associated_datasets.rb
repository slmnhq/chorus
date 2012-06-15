class RenameGpdbDatabaseObjectWorkspaceAssociationsToAssociatedDatasets < ActiveRecord::Migration
  def change
    rename_table :gpdb_database_object_workspace_associations, :associated_datasets
  end
end
