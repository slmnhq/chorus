require 'spec_helper'

describe WorkspaceMigrator, :type => :data_migration do
  describe ".migrate" do
    describe "the new foreign key column" do
      before(:each) do
        Legacy.connection.column_exists?(:edc_workspace, :chorus_rails_workspace_id).should be_false
      end

      it "adds the new foreign key column" do
        WorkspaceMigrator.new.migrate
        Legacy.connection.column_exists?(:edc_workspace, :chorus_rails_workspace_id).should be_true
      end
    end

    describe "copying the data" do
      before do
        WorkspaceMigrator.new.migrate
      end

      it "creates new workspaces for legacy GPDB instances" do
        Workspace.count.should == 73
      end

      it "copies the correct data fields from the legacy instance" do
        Legacy.connection.select_all("SELECT * FROM edc_workspace").each do |legacy_workspace|
          workspace = Workspace.find(legacy_workspace["chorus_rails_workspace_id"])
          workspace.name.should == legacy_workspace["name"]
        end
      end
    end
  end
end