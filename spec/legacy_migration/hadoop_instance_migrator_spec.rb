require 'legacy_migration_spec_helper'

describe HadoopInstanceMigrator do
  describe ".migrate" do
    before :all do
      HadoopInstanceMigrator.migrate
    end

    describe "copying the data" do
      it "creates new instances for legacy hadoop instances and is idempotent" do
        count = Legacy.connection.select_all("select count(*) from edc_instance where instance_provider = 'Hadoop'").first["count"]
        HadoopInstance.count.should == count
        HadoopInstanceMigrator.migrate
        HadoopInstance.count.should == count
      end

      it "copies the correct data fields from the legacy instance" do
        Legacy.connection.select_all("select ei.* , eam.db_user_name from edc_instance ei
        INNER JOIN edc_account_map eam ON eam.instance_id = ei.id where instance_provider = 'Hadoop'").each do |row|
          instance1 = HadoopInstance.find_by_legacy_id(row['id'])
          instance1.name.should == row['name']
          instance1.username.should == row['db_user_name'].split(",")[0]
          instance1.group_list.should == row['db_user_name'].split(",")[1]
          instance1.description.should == row['description']
          instance1.host.should == row['host']
          instance1.port.should == row['port']
          instance1.owner.should == User.unscoped.find_by_username(row['owner'])
        end
      end
    end
  end
end
