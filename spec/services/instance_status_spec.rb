require 'spec_helper'

describe InstanceStatus do
  describe "#check_hdfs_instances" do
    let(:instance1) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }
    let(:instance2) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }
    let(:instance3) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }

    describe "#check_hdfs_instances" do
      before do
        mock(Hdfs::QueryService).instance_version(instance1) { "1.0.0" }
        mock(Hdfs::QueryService).instance_version(instance2) { nil }
        mock(Hdfs::QueryService).instance_version(instance3) { "0.20.205" }
      end

      it "updates the connection status for each instance" do
        InstanceStatus.check_hdfs_instances

        instance1.reload.should be_online
        instance2.reload.should_not be_online
        instance3.reload.should be_online
      end

      it "updates the version for each instance" do
        InstanceStatus.check_hdfs_instances

        instance1.reload.version.should == "1.0.0"
        instance2.reload.version.should == "0.20.1"
        instance3.reload.version.should == "0.20.205"
      end
    end
  end

  describe "#check_gpdb_instances" do
    let(:user1) { FactoryGirl::create :user }

    let(:instance_account1) { FactoryGirl::create :instance_account, :instance => instance1, :owner => user1 }
    let(:instance_account2) { FactoryGirl::create :instance_account, :instance => instance2, :owner => user1 }
    let(:instance_account3) { FactoryGirl::create :instance_account, :instance => instance3, :owner => user1 }

    let(:instance1) { FactoryGirl.create :instance, :owner_id => user1.id }
    let(:instance2) { FactoryGirl.create :instance, :owner_id => user1.id }
    let(:instance3) { FactoryGirl.create :instance, :owner_id => user1.id }

    context "successfully connect to the database" do

      before do
        stub_gpdb(instance_account1,
                  "select version()" => [{"version" => "PostgreSQL 9.2.15 (Greenplum Database 4.1.1.1 build 1) on i386-apple-darwin9.8.0, compiled by GCC gcc (GCC) 4.4.2 compiled on May 12 2011 18:08:53"}]
        )
        stub_gpdb(instance_account2,
                  "select version()" => [{"version" => "PostgreSQL 9.2.15 (Greenplum Database 4.1.1.2 build 2) on i386-apple-darwin9.8.0, compiled by GCC gcc (GCC) 4.4.2 compiled on May 12 2011 18:08:53"}]
        )
        stub_gpdb_fail(instance_account3)
      end

      it "checks the connection status for each instance" do
        instance1.update_attribute(:state, "offline")
        instance2.update_attribute(:state, "offline")
        instance3.update_attribute(:state, "online")

        InstanceStatus.check_gpdb_instances

        instance1.reload.state.should == "online"
        instance2.reload.state.should == "online"
        instance3.reload.state.should == "offline"
      end


      it "checks the version for each instance" do
        instance1.update_attribute(:version, "random_version")
        instance2.update_attribute(:version, "random_version")
        instance3.update_attribute(:version, "random_version")

        InstanceStatus.check_gpdb_instances

        instance1.reload.version.should == "4.1.1.1"
        instance2.reload.version.should == "4.1.1.2"
        instance3.reload.version.should == "random_version"
      end
    end

    context "Exception occur while trying to connect to the database" do
      before do
        stub_gpdb_fail(instance_account1)

        stub_gpdb(instance_account2,
                  "select version()" => [{"version" => "PostgreSQL 9.2.15 (Greenplum Database 4.1.1.2 build 2) on i386-apple-darwin9.8.0, compiled by GCC gcc (GCC) 4.4.2 compiled on May 12 2011 18:08:53"}]
        )
        stub_gpdb(instance_account3,
                  "select version()" => [{"version" => "PostgreSQL 9.2.15 (Greenplum Database 4.1.1.1 build 1) on i386-apple-darwin9.8.0, compiled by GCC gcc (GCC) 4.4.2 compiled on May 12 2011 18:08:53"}]
        )
      end

      it "does not fail to update other instances" do
        instance1.update_attribute(:state, "offline")
        instance2.update_attribute(:state, "offline")
        instance3.update_attribute(:state, "online")

        InstanceStatus.check_gpdb_instances

        instance1.reload.state.should == "offline"
        instance2.reload.state.should == "online"
        instance3.reload.state.should == "online"
      end
    end
  end
end
