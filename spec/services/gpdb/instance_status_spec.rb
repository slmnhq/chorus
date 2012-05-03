require 'spec_helper'

describe Gpdb::InstanceStatus do
  describe "#check" do
    before(:each) do
      @instance1 = FactoryGirl.create :instance
      @instance2 = FactoryGirl.create :instance
      @instance3 = FactoryGirl.create :instance
      mock(Instance).scoped.with_any_args { [@instance1, @instance2, @instance3] }
      mock(ConnectionBuilder).temp_connection(@instance1) { true }
      mock(ConnectionBuilder).temp_connection(@instance2) { true }
      mock(ConnectionBuilder).temp_connection(@instance3) { false }

      mock(Instance).save!.with_any_args.times(3)
    end

    it "checks the connection status for each instance" do
      InstanceStatus.check

      @instance1.status.should == "online"
      @instance2.status.should == "online"
      @instance3.status.should == "offline"
    end
  end
end
