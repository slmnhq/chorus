require 'legacy_migration_spec_helper'

describe InstanceAccountMigrator do
  describe ".migrate" do
    describe "validate the number of entries migrated" do
      it "creates new InstanceAccounts from old AccountMap and is idempotent" do
        InstanceAccountMigrator.migrate
        InstanceAccount.count.should == 4
        InstanceAccountMigrator.migrate
        InstanceAccount.count.should == 4
      end
    end

    describe "copying the data" do
      it "ignores the zombie accounts" do
        InstanceAccount.where(:db_username => "zombie").should_not be_present
      end

      it "copies the necessary fields" do
        Legacy.connection.select_all("SELECT edc_account_map.*, edc_instance.id AS legacy_instance_id, edc_user.id AS legacy_user_id
                FROM edc_account_map
                LEFT OUTER JOIN edc_instance ON edc_account_map.instance_id = edc_instance.id
                LEFT OUTER JOIN edc_user ON edc_user.user_name = edc_account_map.user_name
                WHERE edc_instance.instance_provider = 'Greenplum Database'
                ORDER BY edc_account_map.instance_id, edc_account_map.shared DESC").each do |legacy|

          account = InstanceAccount.find_by_legacy_id(legacy["id"])
          next if account.nil?
          account.db_username.should == legacy["db_user_name"]
          account.db_password.should == "secret"
          account.owner.legacy_id.should == legacy["legacy_user_id"]
          account.instance.legacy_id.should == legacy["legacy_instance_id"]
        end
      end

      it "marks instances as shared when shared accounts exist" do
        Instance.find_by_legacy_id('10020').should be_shared
      end
    end
  end
end
