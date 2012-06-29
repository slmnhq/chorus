require 'spec_helper'

describe HadoopInstanceMigrator, :data_migration => true, :type => :data_migration do
  describe ".migrate" do
    describe "the new foreign key column" do
      before(:each) do
        Legacy.connection.column_exists?(:edc_instance, :chorus_rails_instance_id).should be_false
      end

      it "adds the new foreign key column" do
        UserMigrator.new.migrate
        HadoopInstanceMigrator.new.migrate
        Legacy.connection.column_exists?(:edc_instance, :chorus_rails_instance_id).should be_true
      end
    end

    describe "copying the data" do
      before do
        UserMigrator.new.migrate
        HadoopInstanceMigrator.new.migrate
      end

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