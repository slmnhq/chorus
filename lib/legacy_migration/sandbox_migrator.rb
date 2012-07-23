class SandboxMigrator
  def migrate
    legacy_workspaces.each do |workspace|
      new_workspace = Workspace.find_with_destroyed(workspace["chorus_rails_workspace_id"])

      legacy_sandbox = Legacy.connection.select_all("SELECT * FROM edc_sandbox where workspace_id = '#{workspace["id"]}'").first

      if legacy_sandbox
        legacy_instance = Legacy.connection.select_all("SELECT * FROM edc_instance where id = '#{legacy_sandbox["instance_id"]}'").first
        rails_instance = Instance.find(legacy_instance["chorus_rails_instance_id"])

        database = rails_instance.databases.where(:name => legacy_sandbox["database_name"]).first
        schema = database.schemas.where(:name => legacy_sandbox["schema_name"]).first if database
        new_workspace.sandbox_id = schema.id if schema
      end

      new_workspace.save!(:validate => false)

    end
  end

  def legacy_workspaces
    Legacy.connection.select_all(<<SQL)
      SELECT edc_workspace.*
      FROM edc_workspace
SQL
  end
end
