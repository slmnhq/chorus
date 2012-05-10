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
    stub(Hdfs::ConnectionBuilder).check! { true }
  end

  describe ".create!" do
    it "requires that the instance be valid" do
      any_instance_of(HadoopInstance) do |instance|
        mock(instance).valid?.with_any_args { true }
      end

      Hdfs::InstanceRegistrar.create!(instance_attributes, owner)
    end

    it "requires that a real connection to HDFS can be established" do
      stub(Hdfs::ConnectionBuilder).check! { raise(ApiValidationError.new) }
      expect { Hdfs::InstanceRegistrar.create!(instance_attributes, owner) }.to raise_error
      expect {
        begin
          Hdfs::InstanceRegistrar.create!(instance_attributes, owner)
        rescue
        end
      }.not_to change(HadoopInstance, 'count')
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
