require 'spec_helper'

resource "Greenplum DB: instances" do
  let(:owner) { gpdb_instance.owner }
  let(:gpdb_instance_id) { gpdb_instance.to_param }

  before do
    log_in owner
  end

  post "/gpdb_instances/:gpdb_instance_id/sharing" do
    parameter :gpdb_instance_id, "Greenplum instance id"

    let(:gpdb_instance) { gpdb_instances(:owners) }

    example_request "Allow individual users to share the instance owner's account" do
      status.should == 201
    end
  end

  delete "/gpdb_instances/:gpdb_instance_id/sharing" do
    parameter :gpdb_instance_id, "Greenplum instance id"

    let(:gpdb_instance) { gpdb_instances(:shared) }

    example_request "Require individual accounts to access the instance" do
      status.should == 200
    end
  end
end
