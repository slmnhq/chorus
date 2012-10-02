require 'spec_helper'

describe GpdbInstances::OwnerController do
  let(:gpdb_instance) { gpdb_instances(:shared) }
  let(:user) { gpdb_instance.owner }
  let(:new_owner) { users(:no_collaborators) }

  ignore_authorization!

  before do
    log_in user
  end

  describe "#update" do
    def request_ownership_update
      put :update, :gpdb_instance_id => gpdb_instance.to_param, :owner => {:id => new_owner.to_param }
    end

    it "uses authorization" do
      mock(controller).authorize!(:edit, gpdb_instance)
      request_ownership_update
    end

    it "switches ownership of instance and account" do
      mock(Gpdb::InstanceOwnership).change(user, gpdb_instance, new_owner)
      request_ownership_update
    end

    it "presents the gpdb instance" do
      stub(Gpdb::InstanceOwnership).change(user, gpdb_instance, new_owner)
      mock_present { |instance_presented| instance_presented.should == gpdb_instance }
      request_ownership_update
    end
  end
end
