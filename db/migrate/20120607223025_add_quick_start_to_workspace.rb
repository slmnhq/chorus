class AddQuickStartToWorkspace < ActiveRecord::Migration
  def change
    add_column :workspaces, :has_added_member, :boolean, :default => false
    add_column :workspaces, :has_added_workfile, :boolean, :default => false
    add_column :workspaces, :has_added_sandbox, :boolean, :default => false
    add_column :workspaces, :has_changed_settings, :boolean, :default => false
  end
end
