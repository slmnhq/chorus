require 'spec_helper_no_transactions'

describe MembershipMigrator do
  describe ".migrate" do
    before :all do
      MembershipMigrator.new.migrate
    end

    describe "copying the data" do
      it "creates new membership for legacy GPDB instances, including new owner-workspaces associations that did not exist and be idempotent" do
        Membership.count.should == 75
        MembershipMigrator.new.migrate
        Membership.count.should == 75
      end

      it "copies the correct data fields from the legacy member" do
        Legacy.connection.select_all("SELECT * FROM edc_member").each do |legacy_member|
          membership = Membership.find(legacy_member["chorus_rails_membership_id"])
          membership.user.should == User.unscoped.find_by_username(legacy_member["member_name"])
          legacy_workspace_row = Legacy.connection.select_one("select * from edc_workspace where id = '#{membership.workspace.legacy_id}'")
          membership.workspace.name.should == legacy_workspace_row["name"]
        end
      end
    end
  end
end
