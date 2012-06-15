require 'spec_helper'

describe Hdfs::InstanceRegistrar do
  let(:owner) { FactoryGirl.create(:user) }
  let(:hadoop_version) { "0.1.2.3" }
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
      it "does not save the object" do
        expect {
          Hdfs::InstanceRegistrar.create!({}, owner)
        }.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "when a connection is made using some hadoop version" do
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

      it "makes a HADOOP_INSTANCE_CREATED event" do
        instance = Hdfs::InstanceRegistrar.create!(instance_attributes, owner)

        event = Events::HADOOP_INSTANCE_CREATED.first
        event.hadoop_instance.should == instance
        event.actor.should == owner
      end
    end
  end

  describe ".update!" do
    let(:hadoop_instance) { HadoopInstance.new(instance_attributes) }

    context "invalid changes to the instance are made" do
      before do
        hadoop_instance.owner = owner
        hadoop_instance.save

        instance_attributes[:name] = ''
      end

      it "raises an exception" do
        expect do
          described_class.update!(hadoop_instance.id, instance_attributes)
        end.to raise_error(ActiveRecord::RecordInvalid)
      end
    end

    context "valid changes to the instance are made" do
      before do
        hadoop_instance.owner = owner
        hadoop_instance.save

        instance_attributes[:username] = "another_username"
      end

      it "raises an exception" do
        described_class.update!(hadoop_instance.id, instance_attributes)
        hadoop_instance.reload

        hadoop_instance.username.should == 'another_username'
      end
    end
  end
end
