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
    stub(Hdfs::ConnectionBuilder).find_version { "0.1.2.3" }
  end

  describe ".create!" do
    it "requires that the instance be valid" do
      any_instance_of(HadoopInstance) do |instance|
        mock(instance).valid?.with_any_args { true }
      end

      Hdfs::InstanceRegistrar.create!(instance_attributes, owner)
    end

    context "when a connection is made using some hadoop version" do
      it "save the instance with right version" do
        stub(Hdfs::ConnectionBuilder).find_version(anything) { "0.1.2.3" }
        instance = Hdfs::InstanceRegistrar.create!(instance_attributes, owner)
        instance.version.should == "0.1.2.3"
        instance.id.should_not be_nil
      end
    end

    context "when none of the hadoop versions can successfully connect" do
      it "will not create the instance" do
        stub(Hdfs::ConnectionBuilder).find_version { nil }
        expect { Hdfs::InstanceRegistrar.create!(instance_attributes, owner) }.to raise_error ApiValidationError
        expect {
          begin
            Hdfs::InstanceRegistrar.create!(instance_attributes, owner)
          rescue
          end
        }.not_to change(HadoopInstance, 'count')
      end
    end

    it "caches the hdfs instance" do
      Hdfs::InstanceRegistrar.create!(instance_attributes, owner)

      cached_instance = HadoopInstance.find_by_name_and_owner_id(instance_attributes[:name], owner.id)
      cached_instance.host.should == instance_attributes[:host]
      cached_instance.port.should == instance_attributes[:port]
      cached_instance.description.should == instance_attributes[:description]
      cached_instance.description.should == instance_attributes[:description]
      cached_instance.username.should == instance_attributes[:username]
      cached_instance.group_list.should == instance_attributes[:group_list]
    end

    it "returns the cached instance" do
      instance = Hdfs::InstanceRegistrar.create!(instance_attributes, owner)
      instance.should == HadoopInstance.find_by_name_and_owner_id(instance_attributes[:name], owner.id)
    end
  end
end
