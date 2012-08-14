require 'spec_helper_no_transactions'

describe HadoopInstanceMigrator do
  describe ".migrate" do
    before :all do
      UserMigrator.new.migrate if User.count == 0
      HadoopInstanceMigrator.new.migrate if HadoopInstance.count == 0
    end

    describe "copying the data" do
      it "creates new instances for legacy hadoop instances" do
        HadoopInstance.count.should == 2
      end

      it "copies the correct data fields from the legacy instance" do
        HadoopInstanceMigrator.new.legacy_instances.each do |legacy_instance|
          instance = HadoopInstance.find(legacy_instance["chorus_rails_instance_id"])
          instance.name.should == legacy_instance["name"]
          instance.username.should == legacy_instance["db_user_name"].split(',')[0]
          instance.group_list.should == legacy_instance["db_user_name"].split(',')[1..-1].join(",")
          instance.description.should == legacy_instance["description"]
          instance.host.should == legacy_instance["host"]
          instance.port.should == legacy_instance["port"].to_i
          instance.owner.should == User.find_by_username(legacy_instance["owner"])
        end
      end
    end
  end
end
