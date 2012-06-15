class AddSandboxToWorkspace < ActiveRecord::Migration
  def change
    add_column :workspaces, :sandbox_id, :integer
    add_column :gpdb_schemas, :workspace_id, :integer
  end
end
