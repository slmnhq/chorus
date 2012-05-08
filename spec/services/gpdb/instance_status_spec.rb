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
    before do
      stub(Gpdb::ConnectionBuilder).with_connection.with_any_args { nil }
      stub(Gpdb::ConnectionBuilder).with_connection(instance1, instance_account1).yields
      stub(Gpdb::ConnectionBuilder).with_connection(instance2, instance_account2).yields
      stub(Gpdb::ConnectionBuilder).with_connection(instance3, instance_account3) { nil }
    end

    it "checks the connection status for each instance" do
      instance1.state = "ffff"
      instance2.state = "ffff"
      instance3.state = "ffff"

      Gpdb::InstanceStatus.check

      instance1.reload.state.should == "online"
      instance2.reload.state.should == "online"
      instance3.reload.state.should == "offline"
    end
  end
end
