require 'spec_helper'

describe Instances::OwnerController do
  let(:user) { instance.owner }
  let(:instance) { FactoryGirl.create(:instance, :shared => true) }
  let(:new_owner) { FactoryGirl.create(:user) }

  ignore_authorization!

  before do
    log_in user
  end

  describe "#update" do
    def request_ownership_update
      put :update, :instance_id => instance.to_param, :owner => {:id => new_owner.to_param }
    end

    it "uses authorization" do
      mock(controller).authorize!(:edit, instance)
      request_ownership_update
    end

    it "switches ownership of instance and account" do
      mock(Gpdb::InstanceOwnership).change(user, instance, new_owner)
      request_ownership_update
    end

    it "presents the instance" do
      stub(Gpdb::InstanceOwnership).change(user, instance, new_owner)
      mock_present { |instance_presented| instance_presented.should == instance }
      request_ownership_update
    end
  end
end
