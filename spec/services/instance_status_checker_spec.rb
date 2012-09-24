require 'spec_helper'

describe InstanceStatusChecker do

  shared_examples :it_checks_an_instance_with_exponential_backoff do |check_method|

    define_method :check_and_reload do |instance|
      begin
        InstanceStatusChecker.check_each_instance([instance])
      rescue
        # failed JDBC connections generate exceptions that should probably be handled by specific instance checkers
      ensure
        instance.reload
      end
    end

    before do
      [offline_instance, online_instance].each do |instance|
        instance.last_online_at = last_online_at
        instance.last_checked_at = last_checked_at
        instance.save!
      end
    end

    context "when the instance will be online for the first time" do
      let(:last_online_at) { nil }
      let(:last_checked_at) { nil }
      it "updates the last_online_at timestamp" do
        expect {
          check_and_reload(online_instance)
        }.to change(online_instance, :last_online_at)
      end
    end

    context "when instance is still online" do
      let(:last_online_at) { 1.minute.ago }
      let(:last_checked_at) { 1.minute.ago }

      it "updates the last_checked_at timestamp on instance" do
        previously_updated_at = online_instance.updated_at
        expect {
          check_and_reload(online_instance)
        }.to change(online_instance, :last_checked_at)
        online_instance.last_checked_at.should > previously_updated_at
      end

      it "updates last_checked_at and last_online_at" do
        expect {
          check_and_reload(online_instance)
        }.to change(online_instance, :last_online_at)
      end
    end

    context "when the instance becomes offline" do
      let(:last_online_at) { 1.minute.ago }
      let(:last_checked_at) { 1.minute.ago }

      it "doesn't update the last_online_at timestamp for instances that are offline" do
        expect {
          check_and_reload(offline_instance)
        }.not_to change(offline_instance, :last_online_at)
      end
    end

    context "when the instance was offline at the last check" do
      context "when elapsed time since last check is greater than maximum check interval" do
        let(:last_online_at) { 1.year.ago }
        let(:last_checked_at) { 1.day.ago }

        it "checks the instance" do
          expect {
            check_and_reload(offline_instance)
          }.to change(offline_instance, :last_checked_at)
        end
      end

      context "when elapsed time since last check is more than double the downtime" do
        let(:last_online_at) { 10.minutes.ago }
        let(:last_checked_at) { 3.minutes.ago }

        it "does not check instance" do
          expect {
            check_and_reload(offline_instance)
          }.not_to change(offline_instance, :last_checked_at)
        end
      end

      context "when elapsed time since last check is less than double the downtime" do
        let(:last_online_at) { 10.minutes.ago }
        let(:last_checked_at) { 7.minutes.ago }

        it "checks the instance" do
          expect {
            check_and_reload(offline_instance)
          }.to change(offline_instance, :last_checked_at)
        end
      end
    end
  end

  describe "Hadoop Instances:" do
    let(:hadoop_instance1) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }
    let(:hadoop_instance2) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }
    let(:hadoop_instance3) { FactoryGirl.create :hadoop_instance, :online => false, :version => "0.20.1" }

    describe ".check_hdfs_instances" do
      before { HadoopInstance.delete_all } # remove fixtures

      before do
        stub(Hdfs::QueryService).instance_version(hadoop_instance1) { "1.0.0" }
        stub(Hdfs::QueryService).instance_version(hadoop_instance2) { nil }
        stub(Hdfs::QueryService).instance_version(hadoop_instance3) { "0.20.205" }
      end

      it "updates the connection status for each instance" do
        InstanceStatusChecker.check_hdfs_instances

        hadoop_instance1.reload.should be_online
        hadoop_instance2.reload.should_not be_online
        hadoop_instance3.reload.should be_online
      end

      it "updates the version for each instance" do
        InstanceStatusChecker.check_hdfs_instances

        hadoop_instance1.reload.version.should == "1.0.0"
        hadoop_instance2.reload.version.should == "0.20.1"
        hadoop_instance3.reload.version.should == "0.20.205"
      end
    end

    it_behaves_like :it_checks_an_instance_with_exponential_backoff do
      let(:online_instance) { hadoop_instance3 }
      let(:offline_instance) { hadoop_instance2 }
      before do
        stub(Hdfs::QueryService).instance_version(online_instance) { "0.20.205" }
        stub(Hdfs::QueryService).instance_version(offline_instance) { nil }
      end
    end
  end

  describe "GPDB Instances:" do
    let(:user1) { FactoryGirl::create :user }

    let(:instance_account1) { FactoryGirl::create :instance_account, :gpdb_instance => gpdb_instance1, :owner => user1 }
    let(:instance_account2) { FactoryGirl::create :instance_account, :gpdb_instance => gpdb_instance2, :owner => user1 }
    let(:instance_account3) { FactoryGirl::create :instance_account, :gpdb_instance => gpdb_instance3, :owner => user1 }

    let(:gpdb_instance1) { FactoryGirl.create :gpdb_instance, :owner_id => user1.id }
    let(:gpdb_instance2) { FactoryGirl.create :gpdb_instance, :owner_id => user1.id }
    let(:gpdb_instance3) { FactoryGirl.create :gpdb_instance, :owner_id => user1.id }

    describe ".check_gpdb_instances" do
      before { GpdbInstance.delete_all } # remove fixtures

      context "when the database connection is successful" do
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

          InstanceStatusChecker.check_gpdb_instances

          gpdb_instance1.reload.state.should == "online"
          gpdb_instance2.reload.state.should == "online"
          gpdb_instance3.reload.state.should == "offline"
        end

        it "checks the version for each gpdb instance" do
          gpdb_instance1.update_attribute(:version, "random_version")
          gpdb_instance2.update_attribute(:version, "random_version")
          gpdb_instance3.update_attribute(:version, "random_version")

          InstanceStatusChecker.check_gpdb_instances

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

          InstanceStatusChecker.check_gpdb_instances

          gpdb_instance1.reload.state.should == "offline"
          gpdb_instance2.reload.state.should == "online"
          gpdb_instance3.reload.state.should == "online"
        end
      end
    end

    it_behaves_like :it_checks_an_instance_with_exponential_backoff do
      let(:online_instance) { gpdb_instance3 }
      let(:offline_instance) do
        gpdb_instance1.update_attributes(:state => "offline")
        gpdb_instance1
      end
      before do
        stub_gpdb(instance_account3,
                  "select version()" => [{"version" => "PostgreSQL 9.2.15 (Greenplum Database 4.1.1.1 build 1) on i386-apple-darwin9.8.0, compiled by GCC gcc (GCC) 4.4.2 compiled on May 12 2011 18:08:53"}]
        )
        stub_gpdb_fail(offline_instance)
      end
    end
  end
end

