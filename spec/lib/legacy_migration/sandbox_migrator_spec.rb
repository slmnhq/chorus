require 'spec_helper_no_transactions'

describe SandboxMigrator do
  it "stores the schema id that corresponds to the associated legacy sandbox in the respective migrated workspace" do
    SandboxMigrator.new.migrate
    Workspace.unscoped.where("sandbox_id is not null").count.should == 8

    Legacy.connection.select_all("SELECT * FROM edc_sandbox").each do |legacy_sandbox|
      legacy_instance = Legacy.connection.select_all("SELECT * FROM edc_instance where id = '#{legacy_sandbox["instance_id"]}'").first
      database = Instance.find_by_legacy_id(legacy_instance["id"]).databases.where(:name => legacy_sandbox["database_name"]).first
      schema = database.schemas.where(:name => legacy_sandbox["schema_name"]).first
      legacy_workspace = Legacy.connection.select_all("SELECT * FROM edc_workspace where id = '#{legacy_sandbox["workspace_id"]}'").first

      workspace = Workspace.unscoped.find_by_legacy_id(legacy_workspace["id"])
      workspace.sandbox_id.should == schema.id
    end
  end
end
