require 'spec_helper'

describe MembershipMigrator, :legacy_migration => true, :type => :legacy_migration do
  describe ".migrate" do
    before do
      UserMigrator.new.migrate
      WorkspaceMigrator.new.migrate
    end

    describe "the new foreign key column" do
      before(:each) do
        Legacy.connection.column_exists?(:edc_member, :chorus_rails_membership_id).should be_false
      end

      it "adds the new foreign key column" do
        MembershipMigrator.new.migrate
        Legacy.connection.column_exists?(:edc_member, :chorus_rails_membership_id).should be_true
      end
    end

    describe "copying the data" do
      it "creates new membership for legacy GPDB instances" do
        expect {
          MembershipMigrator.new.migrate
          }.to change(Membership, :count).by(70)
      end

      it "copies the correct data fields from the legacy member" do
        MembershipMigrator.new.migrate

        Legacy.connection.select_all("SELECT * FROM edc_member").each do |legacy_member|
          membership = Membership.find(legacy_member["chorus_rails_membership_id"])
          membership.user.should == User.unscoped.find_by_username(legacy_member["member_name"])
          legacy_workspace_row = Legacy.connection.select_one("select * from edc_workspace where id = '#{legacy_member["workspace_id"]}'")
          membership.workspace.name.should == legacy_workspace_row["name"]
        end
      end
    end
  end
end
