require 'spec_helper'


describe Gpdb::InstanceStatus do
  describe "#check" do
    let(:user1) { FactoryGirl::create :user}
    let(:user2) { FactoryGirl::create :user}

    let(:instance_account1) { FactoryGirl::create :instance_account, :db_username => "user1", :db_password => "pw1", :owner => user1 }
    let(:instance_account2) { FactoryGirl::create :instance_account, :db_username => "user2", :db_password => "pw2", :owner => user2 }

    let(:instance1) { FactoryGirl.create :instance, :owner_id => user1.id }
    let(:instance2) { FactoryGirl.create :instance, :owner_id => user2.id }
    let(:instance3) { FactoryGirl.create :instance, :owner_id => user2.id }

    before(:each) do
      mock(Instance).scoped.with_any_args { [instance1, instance2, instance3] }
      Gpdb::ConnectionBuilder.respond_to?(:test_connection).should == true
      Gpdb::ConnectionBuilder.method(:test_connection).arity.should == 2

      mock(Gpdb::ConnectionBuilder).test_connection(instance1, instance_account1) { true }
      mock(Gpdb::ConnectionBuilder).test_connection(instance2, instance_account2) { true }
      mock(Gpdb::ConnectionBuilder).test_connection(instance3, instance_account2) { false }

      mock(instance1).save!.with_any_args
      mock(instance2).save!.with_any_args
      mock(instance3).save!.with_any_args
    end

    it "checks the connection status for each instance" do
      Gpdb::InstanceStatus.check

      instance1.state.should == "online"
      instance2.state.should == "online"
      instance3.state.should == "offline"
    end
  end
end
