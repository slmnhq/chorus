require 'spec_helper'


describe Gpdb::InstanceStatus do
  let(:user1) { FactoryGirl::create :user}

  let(:instance_account1) { FactoryGirl::create :instance_account, :instance => instance1, :owner => user1 }
  let(:instance_account2) { FactoryGirl::create :instance_account, :instance => instance2, :owner => user1 }
  let(:instance_account3) { FactoryGirl::create :instance_account, :instance => instance3, :owner => user1 }

  let(:instance1) { FactoryGirl.create :instance, :owner_id => user1.id }
  let(:instance2) { FactoryGirl.create :instance, :owner_id => user1.id }
  let(:instance3) { FactoryGirl.create :instance, :owner_id => user1.id }

  describe "#check" do

    let(:fake_connection1) do
      mock(Object.new).query("select version()") do
        [["PostgreSQL 8.2.15 (Greenplum Database 4.1.1.1 build 1) on i386-apple-darwin9.8.0, compiled by GCC gcc (GCC) 4.4.2 compiled on May 12 2011 18:08:53"]]
      end.subject
    end

    let(:fake_connection2) do
      mock(Object.new).query("select version()") do
        [["PostgreSQL 9.2.15 (Greenplum Database 4.1.1.2 build 2) on i386-apple-darwin9.8.0, compiled by GCC gcc (GCC) 4.4.2 compiled on May 12 2011 18:08:53"]]
      end.subject
    end

    before do
      stub(Gpdb::ConnectionBuilder).with_connection.with_any_args { nil }
      stub(Gpdb::ConnectionBuilder).with_connection(instance1, instance_account1).yields(fake_connection1)
      stub(Gpdb::ConnectionBuilder).with_connection(instance2, instance_account2).yields(fake_connection2)
      stub(Gpdb::ConnectionBuilder).with_connection(instance3, instance_account3) { nil }
    end

    it "checks the connection status for each instance" do
      instance1.update_attributes!(:state => "ffff")
      instance2.update_attributes!(:state => "ffff")
      instance3.update_attributes!(:state => "ffff")

      Gpdb::InstanceStatus.check

      instance1.reload.state.should == "online"
      instance2.reload.state.should == "online"
      instance3.reload.state.should == "offline"
    end

    it "checks the version for each instance" do
      instance1.update_attributes!(:version => "random_version")
      instance2.update_attributes!(:version => "random_version")
      instance3.update_attributes!(:version => "random_version")

      Gpdb::InstanceStatus.check

      instance1.reload.version.should == "4.1.1.1"
      instance2.reload.version.should == "4.1.1.2"
      instance3.reload.version.should == "random_version"
    end
  end
end
