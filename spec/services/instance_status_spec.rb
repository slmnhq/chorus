require 'spec_helper'

describe InstanceStatus do
  describe "#check_hdfs_instances" do
    let(:hadoop_instance1) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }
    let(:hadoop_instance2) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }
    let(:hadoop_instance3) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }

    describe "#check_hdfs_instances" do
      before do
        mock(Hdfs::QueryService).instance_version(hadoop_instance1) { "1.0.0" }
        mock(Hdfs::QueryService).instance_version(hadoop_instance2) { nil }
        mock(Hdfs::QueryService).instance_version(hadoop_instance3) { "0.20.205" }
      end

      it "updates the connection status for each instance" do
        InstanceStatus.check_hdfs_instances

        hadoop_instance1.reload.should be_online
        hadoop_instance2.reload.should_not be_online
        hadoop_instance3.reload.should be_online
      end

      it "updates the version for each instance" do
        InstanceStatus.check_hdfs_instances

        hadoop_instance1.reload.version.should == "1.0.0"
        hadoop_instance2.reload.version.should == "0.20.1"
        hadoop_instance3.reload.version.should == "0.20.205"
      end
    end
  end

  describe "#check_gpdb_instances" do
    let(:user1) { FactoryGirl::create :user }

    let(:instance_account1) { FactoryGirl::create :instance_account, :gpdb_instance => gpdb_instance1, :owner => user1 }
    let(:instance_account2) { FactoryGirl::create :instance_account, :gpdb_instance => gpdb_instance2, :owner => user1 }
    let(:instance_account3) { FactoryGirl::create :instance_account, :gpdb_instance => gpdb_instance3, :owner => user1 }

    let(:gpdb_instance1) { FactoryGirl.create :gpdb_instance, :owner_id => user1.id }
    let(:gpdb_instance2) { FactoryGirl.create :gpdb_instance, :owner_id => user1.id }
    let(:gpdb_instance3) { FactoryGirl.create :gpdb_instance, :owner_id => user1.id }

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
        gpdb_instance1.update_attribute(:state, "offline")
        gpdb_instance2.update_attribute(:state, "offline")
        gpdb_instance3.update_attribute(:state, "online")

        InstanceStatus.check_gpdb_instances

        gpdb_instance1.reload.state.should == "online"
        gpdb_instance2.reload.state.should == "online"
        gpdb_instance3.reload.state.should == "offline"
      end


      it "checks the version for each gpdb instance" do
        gpdb_instance1.update_attribute(:version, "random_version")
        gpdb_instance2.update_attribute(:version, "random_version")
        gpdb_instance3.update_attribute(:version, "random_version")

        InstanceStatus.check_gpdb_instances

        gpdb_instance1.reload.version.should == "4.1.1.1"
        gpdb_instance2.reload.version.should == "4.1.1.2"
        gpdb_instance3.reload.version.should == "random_version"
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
        gpdb_instance1.update_attribute(:state, "offline")
        gpdb_instance2.update_attribute(:state, "offline")
        gpdb_instance3.update_attribute(:state, "online")

        InstanceStatus.check_gpdb_instances

        gpdb_instance1.reload.state.should == "offline"
        gpdb_instance2.reload.state.should == "online"
        gpdb_instance3.reload.state.should == "online"
      end
    end
  end
end
