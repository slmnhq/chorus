class AddWorkspaceIdToEvents < ActiveRecord::Migration
  def change
    add_column :events, :workspace_id, :integer
  end
end
