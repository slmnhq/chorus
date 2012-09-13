require 'legacy_migration_spec_helper'

describe WorkspaceMigrator do
  describe ".migrate" do
    before :all do
      WorkspaceMigrator.migrate
    end

    describe "copying the data" do
      it "creates new workspaces for legacy workspaces" do
        count = Legacy.connection.select_all("SELECT count(*)  FROM edc_workspace ").first["count"]
        Workspace.unscoped.count.should == count
        WorkspaceMigrator.migrate
        Workspace.unscoped.count.should == count
      end

      it "creates new workspaces for legacy workspaces 2" do
        count = Legacy.connection.select_all("SELECT count(*)  FROM edc_workspace where is_deleted is false ").first["count"]
        Workspace.count.should == count
      end

      it "copies the correct data fields from the legacy workspace" do
        Legacy.connection.select_all("SELECT * FROM edc_workspace where is_deleted is false").each do |legacy_workspace|
          workspace = Workspace.find_by_legacy_id(legacy_workspace["id"])
          workspace.name.should == legacy_workspace["name"]
          workspace.public.should == (legacy_workspace["is_public"] == 't' ? true : false)
          workspace.archived_at.should == legacy_workspace["archived_timestamp"]
          workspace.archiver.should == User.unscoped.find_by_username(legacy_workspace["archiver"])

          workspace.summary.should == legacy_workspace["summary"]

          workspace.owner.should == User.find_by_username(legacy_workspace["owner"])
        end
      end

      it "copies deleted workspaces, and assigns their 'deleted_at' field" do
        Legacy.connection.select_all("SELECT * FROM edc_workspace where is_deleted is true").each do |legacy_workspace|
          workspace = Workspace.unscoped.find_by_legacy_id(legacy_workspace["id"])
          workspace.deleted_at.should == legacy_workspace["last_updated_tx_stamp"]
        end
      end

      it "creates all valid workspaces" do
        MembershipMigrator.migrate
        invalids = Workspace.all.reject { |workspace| workspace.valid? }
        invalids.should be_empty
      end

      it "sets the quickstart fields to true" do
        Legacy.connection.select_all("SELECT * FROM edc_workspace where is_deleted is false").each do |legacy_workspace|
          workspace = Workspace.find_by_legacy_id(legacy_workspace["id"])

          workspace.has_added_member.should == true
          workspace.has_added_sandbox.should == true
          workspace.has_added_workfile.should == true
          workspace.has_changed_settings.should == true
        end
      end
    end
  end
end
