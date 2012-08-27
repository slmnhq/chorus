require 'legacy_migration_spec_helper'

describe InstanceAccountMigrator do
  describe ".migrate" do
    describe "validate the number of entries migrated" do
      it "creates new InstanceAccounts from old AccountMap and is idempotent" do
        total_count = Legacy.connection.select_all("SELECT COUNT(*) from edc_account_map map
                              INNER JOIN edc_instance i
                              ON map.instance_id = i.id
                              AND i.instance_provider = 'Greenplum Database'
        ").first["count"]
        not_moved_count = Legacy.connection.select_all("select count(*) from legacy_migrate.edc_account_map map2 INNER JOIN legacy_migrate.edc_account_map  map1  ON map1.instance_id = map2.instance_id AND map1.shared = 'no' and map2.shared = 'yes'").first["count"]
        count = total_count - not_moved_count
        InstanceAccountMigrator.migrate
        InstanceAccount.count.should == count
        InstanceAccountMigrator.migrate
        InstanceAccount.count.should == count
      end
    end

    describe "copying the data" do
      it "ignores the zombie accounts" do
        Legacy.connection.select_all("select map1.* from legacy_migrate.edc_account_map map2 INNER JOIN legacy_migrate.edc_account_map  map1  ON map1.instance_id = map2.instance_id AND map1.shared = 'no' and map2.shared = 'yes'").each do |row|
          InstanceAccount.where(:db_username => row["id"]).should_not be_present
        end
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
          account.db_password.should == InstanceAccountMigrator.decrypt_password(legacy['db_password'], legacy['secret_key'])
          account.owner.legacy_id.should == legacy["legacy_user_id"]
          account.instance.legacy_id.should == legacy["legacy_instance_id"]
        end
      end

      it "marks instances as shared when shared accounts exist" do
        shared_accounts = Legacy.connection.select_all("SELECT map.instance_id from edc_account_map map
                              INNER JOIN edc_instance i
                              ON map.instance_id = i.id
                              AND i.instance_provider = 'Greenplum Database'
                              WHERE map.shared = 'yes'")
        shared_accounts.each do |row|
          Instance.find_by_legacy_id!(row['instance_id']).should be_shared
        end
        shared_accounts.length.should == Instance.where(:shared => true).count
      end
    end
  end
end
