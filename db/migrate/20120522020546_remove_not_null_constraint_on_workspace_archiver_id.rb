class RemoveNotNullConstraintOnWorkspaceArchiverId < ActiveRecord::Migration
  def up
    change_column :workspaces, :archiver_id, :integer, :null => true
  end

  def down
    change_column :workspaces, :archiver_id, :integer, :null => true
  end
end
