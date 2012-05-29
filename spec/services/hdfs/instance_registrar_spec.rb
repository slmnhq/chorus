require 'spec_helper'

describe Hdfs::InstanceRegistrar do
  let(:owner) { FactoryGirl.create(:user) }
  let(:instance_attributes) do
    {
      :name => "new",
      :description => "old description",
      :port => 12345,
      :host => "server.emc.com",
      :username => "hadoop",
      :group_list => "staff,team1"
    }
  end

  before do
    mock(Hdfs::QueryService).instance_version(is_a(HadoopInstance)) { hadoop_version }
  end

  describe ".create!" do
    context "when connection succeeds but instance is invalid" do
      let(:hadoop_version) { "0.1.2.3" }

      it "does not save the object" do
        expect {
          Hdfs::InstanceRegistrar.create!({}, owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when a connection is made using some hadoop version" do
      let(:hadoop_version) { "0.1.2.3" }

      it "save the instance with right version" do
        instance = Hdfs::InstanceRegistrar.create!(instance_attributes, owner)

        instance.version.should == "0.1.2.3"
        instance.id.should_not be_nil
        instance.should be_valid
      end

      it "saves the hdfs instance" do
        Hdfs::InstanceRegistrar.create!(instance_attributes, owner)

        cached_instance = HadoopInstance.find_by_name_and_owner_id(instance_attributes[:name], owner.id)
        cached_instance.host.should == instance_attributes[:host]
        cached_instance.port.should == instance_attributes[:port]
        cached_instance.description.should == instance_attributes[:description]
        cached_instance.description.should == instance_attributes[:description]
        cached_instance.username.should == instance_attributes[:username]
        cached_instance.group_list.should == instance_attributes[:group_list]
      end
    end
  end
end
