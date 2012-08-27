require 'legacy_migration_spec_helper'

describe UserMigrator do
  describe ".migrate" do
    before do
      UserMigrator.migrate
    end

    describe "copying the data" do
      it "creates new users for legacy users and is idempotent" do
        count = Legacy.connection.exec_query("SELECT count(*) FROM edc_user").first["count"]
        User.unscoped.count.should == count
        UserMigrator.migrate
        User.unscoped.count.should == count
      end

      it "copies the correct data fields from the legacy user" do
        Legacy.connection.exec_query("SELECT * FROM edc_user").each do |legacy_user|
          user = User.unscoped.find_by_legacy_id(legacy_user["id"])
          user.should be_present
          user.username.should == legacy_user["user_name"]
          user.first_name.should == legacy_user["first_name"]
          user.last_name.should == legacy_user["last_name"]
          legacy_user["password"].should == "{SHA}#{user.password_digest}"
          user.email.should == legacy_user["email_address"]
          user.title.should == legacy_user["title"]
          user.dept.should == legacy_user["ou"]
          user.notes.should == legacy_user["notes"]
          if legacy_user["is_deleted"] == "f"
            user.deleted_at.should be_nil
          else
            user.deleted_at.should == legacy_user["last_updated_tx_stamp"]
          end
          user.updated_at.should == legacy_user["last_updated_tx_stamp"]
          user.created_at.should == legacy_user["created_tx_stamp"]
        end
      end

      it "sets the correct password" do
        User.authenticate("edcadmin", "secret").should be_true
      end

      it "creates all valid user objects" do
        User.unscoped.all.reject { |user| user.valid? }.should be_empty
      end
    end
  end
end
