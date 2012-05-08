class AddMetadataForWorkspaces < ActiveRecord::Migration
  def change
      add_column :workspaces, :public, :boolean, :default => true
      add_column :workspaces, :archived_at, :timestamp
      add_column :workspaces, :archiver_id, :integer
      add_column :workspaces, :summary, :text
      add_column :workspaces, :owner_id, :integer
    end
end
