require 'spec_helper'

resource "Greenplum DB ownership" do
  let!(:owner) { users(:bob) }
  let(:owned_instance) { FactoryGirl.create(:gpdb_instance, :owner => owner, :shared => true) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :gpdb_instance => owned_instance, :owner => owner)}
  let!(:new_owner) { users(:no_collaborators) }

  before do
    log_in owner
  end

  put "/gpdb_instances/:gpdb_instance_id/owner" do
    parameter :gpdb_instance_id, "The id of the Greenplum instance"
    parameter :id, "The new owner's user id"

    required_parameters :gpdb_instance_id, :id
    scope_parameters :owner, :all

    let(:gpdb_instance_id) { owned_instance.to_param }
    let(:id) { new_owner.to_param }

    example_request "Change the owner of an instance" do
      status.should == 200
    end
  end
end
