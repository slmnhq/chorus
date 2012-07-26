require 'spec_helper'

describe SandboxMigrator, :legacy_migration => true, :type => :legacy_migration do
  describe ".migrate" do
    before do
      UserMigrator.new.migrate
      InstanceMigrator.new.migrate
      InstanceAccountMigrator.new.migrate
      WorkspaceMigrator.new.migrate
      MembershipMigrator.new.migrate
      SandboxMigrator.new.migrate
    end

    it "stores the schema id that corresponds to the associated legacy sandbox in the respective migrated workspace" do

      Legacy.connection.select_all("SELECT * FROM edc_sandbox where is_deleted is false").each do |legacy_sandbox|
        legacy_instance = Legacy.connection.select_all("SELECT * FROM edc_instance where id = '#{legacy_sandbox["instance_id"]}'").first
        database = Instance.find(legacy_instance["chorus_rails_instance_id"]).databases.where(:name => legacy_sandbox["database_name"]).first
        schema = database.schemas.where(:name => legacy_sandbox["schema_name"]).first
        legacy_workspace = Legacy.connection.select_all("SELECT * FROM edc_workspace where id = '#{legacy_sandbox["workspace_id"]}'").first

        workspace = Workspace.find(legacy_workspace["chorus_rails_workspace_id"])
        workspace.sandbox_id.should == schema.id
      end
    end
  end
end
