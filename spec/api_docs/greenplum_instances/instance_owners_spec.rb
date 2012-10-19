require 'spec_helper'

resource "Greenplum DB: instances" do
  let(:owner) { owned_instance.owner }
  let(:owned_instance) { gpdb_instances(:shared)}
  let(:new_owner) { users(:no_collaborators) }

  before do
    log_in owner
  end

  put "/gpdb_instances/:gpdb_instance_id/owner" do
    parameter :gpdb_instance_id, "Greenplum instance id"
    parameter :id, "The new owner's user id"

    required_parameters :gpdb_instance_id, :id

    let(:gpdb_instance_id) { owned_instance.to_param }
    let(:id) { new_owner.to_param }

    example_request "Change the owner of an instance" do
      status.should == 200
    end
  end
end
