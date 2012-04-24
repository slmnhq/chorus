require 'spec_helper'

describe InstanceCredentialMigrator, :type => :data_migration do
  describe ".migrate" do
    describe "copying the data" do
      before do
        UserMigrator.migrate
        InstanceMigrator.migrate
        InstanceCredentialMigrator.migrate
      end

      it "creates new InstanceCredentials from old AccountMap" do
        InstanceCredential.count.should == 4
      end

      it "adds the new foreign key column" do
        Legacy.connection.column_exists?(:edc_account_map, :chorus_rails_instance_credentials_id).should be_true
      end

      it "copies the necessary fields" do
        InstanceCredentialMigrator.legacy_instance_credentials.each do |legacy|
          credential = InstanceCredential.find(legacy["chorus_rails_instance_credentials_id"])
          credential.username.should == legacy["db_user_name"]
          credential.password.should == legacy["db_password"]
          credential.shared.should == (legacy["shared"] != "no")
          credential.owner_id.should == legacy["chorus_rails_user_id"].to_i
          credential.instance_id.should == legacy["chorus_rails_instance_id"].to_i
        end
      end
    end
  end
end
