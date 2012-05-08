class WorkspaceMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_workspace, :chorus_rails_workspace_id)
      Legacy.connection.add_column :edc_workspace, :chorus_rails_workspace_id, :integer
    end

    legacy_workspaces.each do |workspace|
      new_workspace = Workspace.new
      new_workspace.name = workspace["name"]
      new_workspace.save!

      id = workspace["id"]
      Legacy.connection.update("Update edc_workspace SET chorus_rails_workspace_id = #{new_workspace.id} WHERE id = '#{id}'")
    end
  end

  def legacy_workspaces
    Legacy.connection.select_all(<<SQL)
      SELECT edc_workspace.*
      FROM edc_workspace
SQL
  end
end