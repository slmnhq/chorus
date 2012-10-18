require 'spec_helper'

resource "Greenplum DB: instances" do
  let(:owner) { users(:owner) }
  let(:gpdb_instance) { gpdb_instances(:owners) }
  let!(:database) { gpdb_databases(:default) }
  let!(:gpdb_instance_id) {gpdb_instance.to_param}

  before do
    log_in owner
    stub(GpdbDatabase).refresh.with_any_args { [database] }
  end


  get "/gpdb_instances/:gpdb_instance_id/databases" do
    parameter :gpdb_instance_id, "Id of the instance to get the list of databases"

    example_request "Get a list of databases" do
      status.should == 200
    end
  end

end
