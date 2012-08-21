class DropWorkspaceIdFromGpdbSchema < ActiveRecord::Migration
  def change
    remove_column :gpdb_schemas , :workspace_id
  end
end
