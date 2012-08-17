require 'legacy_migration_spec_helper'

describe HadoopInstanceMigrator do
  describe ".migrate" do
    before :all do
      HadoopInstanceMigrator.new.migrate
    end

    describe "copying the data" do
      it "creates new instances for legacy hadoop instances and is idempotent" do
        HadoopInstance.count.should == 2
        HadoopInstanceMigrator.new.migrate
        HadoopInstance.count.should == 2
      end

      it "copies the correct data fields from the legacy instance" do
        instance1 = HadoopInstance.find_by_legacy_id('10030')
        instance1.name.should == 'hadoopNotHadoopUser'
        instance1.username.should == 'anything'
        instance1.group_list.should == 'anything'
        instance1.description.should == nil
        instance1.host.should == 'chorus-gphd11'
        instance1.port.should == 8020
        instance1.owner.should == User.find_by_username('notadmin')

        instance2 = HadoopInstance.find_by_legacy_id('10001')
        instance2.name.should == 'hadoop'
        instance2.username.should == 'hadoop'
        instance2.group_list.should == 'hadoop'
        instance2.description.should == nil
        instance2.host.should == 'chorus-gphd11'
        instance2.port.should == 8020
        instance2.owner.should == User.find_by_username('edcadmin')
      end
    end
  end
end
