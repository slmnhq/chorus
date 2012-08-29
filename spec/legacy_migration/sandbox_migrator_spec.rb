require 'legacy_migration_spec_helper'

describe SandboxMigrator do
  before do
    SandboxMigrator.migrate
  end

  it "creates new sandbox for legacy sandbox and is idempotent" do
    count = Legacy.connection.select_all("SELECT count(*) FROM edc_sandbox").first["count"]
    Workspace.unscoped.where("sandbox_id is not null").count.should == count
    SandboxMigrator.migrate
    Workspace.unscoped.where("sandbox_id is not null").count.should == count
  end

  it "stores the schema id that corresponds to the associated legacy sandbox in the respective migrated workspace" do
    Legacy.connection.select_all("SELECT * FROM edc_sandbox").each do |legacy_sandbox|
      legacy_instance = Legacy.connection.select_all("SELECT * FROM edc_instance where id = '#{legacy_sandbox["instance_id"]}'").first
      database = GpdbInstance.find_by_legacy_id(legacy_instance["id"]).databases.where(:name => legacy_sandbox["database_name"]).first
      schema = database.schemas.where(:name => legacy_sandbox["schema_name"]).first
      legacy_workspace = Legacy.connection.select_all("SELECT * FROM edc_workspace where id = '#{legacy_sandbox["workspace_id"]}'").first

      workspace = Workspace.unscoped.find_by_legacy_id(legacy_workspace["id"])
      workspace.sandbox_id.should == schema.id
    end
  end
end
