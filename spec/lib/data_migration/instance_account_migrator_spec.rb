require 'spec_helper'

describe InstanceAccountMigrator, :type => :data_migration do
  describe ".migrate" do
    describe "copying the data" do
      before do
        UserMigrator.new.migrate
        InstanceMigrator.new.migrate
        InstanceAccountMigrator.new.migrate
      end

      it "creates new InstanceAccounts from old AccountMap" do
        InstanceAccount.count.should == 4
      end

      it "adds the new foreign key column" do
        Legacy.connection.column_exists?(:edc_account_map, :chorus_rails_instance_account_id).should be_true
      end

      it "copies the necessary fields" do
        InstanceAccount.all.each do |account|
          legacy = Legacy.connection.select_one("SELECT edc_account_map.*, edc_instance.chorus_rails_instance_id, edc_user.chorus_rails_user_id
                FROM edc_account_map
                JOIN edc_instance ON edc_account_map.instance_id = edc_instance.id
                JOIN edc_user ON edc_user.user_name = edc_account_map.user_name
                WHERE chorus_rails_instance_account_id = #{account.id}")
          account.db_username.should == legacy["db_user_name"]
          account.db_password.should == "secret"
          account.owner_id.should == legacy["chorus_rails_user_id"].to_i
          account.instance_id.should == legacy["chorus_rails_instance_id"].to_i
        end
      end

      it "marks instances as shared when shared accounts exist" do
        Instance.find(Legacy.connection.select_one("SELECT chorus_rails_instance_id AS id FROM edc_instance WHERE id = '10020'")["id"]).should be_shared
      end
      
      it "ignores the zombie accounts" do
        InstanceAccount.where(:db_username => "zombie").should_not be_present
      end
    end
  end
end
