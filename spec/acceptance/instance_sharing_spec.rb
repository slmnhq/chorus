require 'spec_helper'

resource "Greenplum DB account sharing" do
  let(:owner) {gpdb_instance.owner }
  let(:gpdb_instance_id) { gpdb_instance.to_param }

  before do
    log_in owner
  end

  post "/gpdb_instances/:gpdb_instance_id/sharing" do
    let!(:gpdb_instance) { gpdb_instances(:owners) }

    example_request "Make instance shared" do
      status.should == 201
    end
  end

  delete "/gpdb_instances/:gpdb_instance_id/sharing" do
    let!(:gpdb_instance) {gpdb_instances(:shared) }

    example_request "Require individual accounts" do
      status.should == 200
    end
  end
end
