require 'spec_helper_no_transactions'

describe WorkspaceMigrator do
  describe ".migrate" do
    before :all do
      UserMigrator.new.migrate if User.unscoped.count == 0
      WorkspaceMigrator.new.migrate if Workspace.count == 0
      MembershipMigrator.new.migrate if Membership.count == 0
    end

    describe "copying the data" do
      it "creates new workspaces for legacy workspaces" do
        Workspace.unscoped.count.should == 73
      end

      it "creates new workspaces for legacy workspaces 2" do
        Workspace.count.should == 68
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
        invalids = Workspace.all.reject { |workspace| workspace.valid? }
        invalids.should be_empty
      end
    end
  end
end
