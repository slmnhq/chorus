require 'spec_helper'

describe Hdfs::InstanceStatus do
  let(:user1) { FactoryGirl::create :user }

  let(:instance1) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }
  let(:instance2) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }
  let(:instance3) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }

  describe "#check" do
    before do
      stub(Hdfs::ConnectionBuilder).find_version(instance1) { "1.0.0" }
      stub(Hdfs::ConnectionBuilder).find_version(instance2) { nil }
      stub(Hdfs::ConnectionBuilder).find_version(instance3) { "0.20.205" }
    end

    it "updates the connection status for each instance" do
      Hdfs::InstanceStatus.check

      instance1.reload.should be_online
      instance2.reload.should_not be_online
      instance3.reload.should be_online
    end

    it "updates the version for each instance" do
      Hdfs::InstanceStatus.check

      instance1.reload.version.should == "1.0.0"
      instance2.reload.version.should == "0.20.1"
      instance3.reload.version.should == "0.20.205"
    end
  end
end
