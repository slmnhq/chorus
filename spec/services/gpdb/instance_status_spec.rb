require 'spec_helper'


describe Gpdb::InstanceStatus do
  describe "#check" do
    before(:each) do
      @instance1 = FactoryGirl.create :instance
      @instance2 = FactoryGirl.create :instance
      @instance3 = FactoryGirl.create :instance
      mock(Instance).scoped.with_any_args { [@instance1, @instance2, @instance3] }
      Gpdb::ConnectionBuilder.respond_to?(:test_connection).should == true

      mock(Gpdb::ConnectionBuilder).test_connection(@instance1) { true }
      mock(Gpdb::ConnectionBuilder).test_connection(@instance2) { true }
      mock(Gpdb::ConnectionBuilder).test_connection(@instance3) { false }

      mock(@instance1).save!.with_any_args
      mock(@instance2).save!.with_any_args
      mock(@instance3).save!.with_any_args
    end

    it "checks the connection status for each instance" do
      Gpdb::InstanceStatus.check

      @instance1.state.should == "online"
      @instance2.state.should == "online"
      @instance3.state.should == "offline"
    end
  end
end
