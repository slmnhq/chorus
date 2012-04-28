require 'spec_helper'

describe InstanceCredentialMigrator, :type => :data_migration do
  describe ".migrate" do
    describe "copying the data" do
      before do
        UserMigrator.new.migrate
        InstanceMigrator.new.migrate
        InstanceCredentialMigrator.new.migrate
      end

      it "creates new InstanceCredentials from old AccountMap" do
        InstanceCredential.count.should == 4
      end

      it "adds the new foreign key column" do
        Legacy.connection.column_exists?(:edc_account_map, :chorus_rails_instance_credentials_id).should be_true
      end

      it "copies the necessary fields" do
        InstanceCredential.all.each do |credential|
          legacy = Legacy.connection.select_one("SELECT edc_account_map.*, edc_instance.chorus_rails_instance_id, edc_user.chorus_rails_user_id
                FROM edc_account_map
                JOIN edc_instance ON edc_account_map.instance_id = edc_instance.id
                JOIN edc_user ON edc_user.user_name = edc_account_map.user_name
                WHERE chorus_rails_instance_credentials_id = #{credential.id}")
          credential.username.should == legacy["db_user_name"]
          credential.password.should == "secret"
          credential.owner_id.should == legacy["chorus_rails_user_id"].to_i
          credential.instance_id.should == legacy["chorus_rails_instance_id"].to_i
        end
      end

      it "marks instances as shared when shared credentials exist" do
        Instance.find(Legacy.connection.select_one("SELECT chorus_rails_instance_id AS id FROM edc_instance WHERE id = '10020'")["id"]).should be_shared
      end
      
      it "ignores the zombie credentials" do
        InstanceCredential.where(:username => "zombie").should_not be_present
      end
    end
  end
end
