require 'legacy_migration_spec_helper'

describe MembershipMigrator do
  describe ".migrate" do
    before :all do
      MembershipMigrator.migrate
    end

    describe "copying the data" do
      it "creates new membership for legacy GPDB instances, including new owner-workspaces associations that did not exist and be idempotent" do
        count = Legacy.connection.select_all("SELECT count(*) FROM edc_member").first["count"]
        count_owner = Legacy.connection.select_all("select count(owner) from legacy_migrate.edc_workspace w where
         owner NOT IN (select member_name from legacy_migrate.edc_member  em where em.workspace_id = w.id) ;").first["count"]
        Membership.count.should == count + count_owner
        MembershipMigrator.migrate
        Membership.count.should == count + count_owner
      end

      it "copies the correct data fields from the legacy member" do
        Legacy.connection.select_all("SELECT * FROM edc_member").each do |legacy_member|
          membership = Membership.find_by_legacy_id(legacy_member["id"])
          membership.user.should == User.unscoped.find_by_username(legacy_member["member_name"])
          legacy_workspace_row = Legacy.connection.select_one("select * from edc_workspace where id = '#{membership.workspace.legacy_id}'")
          membership.workspace.name.should == legacy_workspace_row["name"]
        end
      end
    end
  end
end
