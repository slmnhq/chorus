require 'spec_helper'

describe UserMigrator, :type => :data_migration do
  describe ".migrate" do
    describe "the new foreign key column" do
      before(:each) do
        Legacy.connection.column_exists?(:edc_user, :chorus_rails_user_id).should be_false
      end

      it "adds the new foreign key column" do
        UserMigrator.migrate
        Legacy.connection.column_exists?(:edc_user, :chorus_rails_user_id).should be_true
      end
    end

    describe "copying the data" do
      before do
        UserMigrator.migrate
      end
      it "creates new users for legacy users" do
        User.count.should == 8
      end

      it "copies the correct data fields from the legacy user" do
        Legacy.connection.select_all("SELECT * FROM edc_user").each do |legacy_user|
          user = User.find_by_username(legacy_user["user_name"])
          user.should be_present
          user.username.should be_present
          user.password_digest.should be_present
        end
      end

      it "sets the correct password" do
        User.authenticate("edcadmin", "secret").should be_true
      end
    end
  end
end