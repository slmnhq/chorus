class AddDeletedAtToWorkspaces < ActiveRecord::Migration
  def change
    add_column :workspaces, :deleted_at, :timestamp
  end
end
