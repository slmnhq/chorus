require 'spec_helper'

resource "Greenplum DB instances" do
  let!(:owner) { users(:bob) }
  let(:gpdb_instance) { FactoryGirl.create(:gpdb_instance, :owner => owner) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :gpdb_instance => gpdb_instance, :owner => owner)}
  let!(:database) { FactoryGirl.create(:gpdb_database, :gpdb_instance => gpdb_instance) }
  let!(:gpdb_instance_id) {gpdb_instance.to_param}

  before do
    log_in owner
    stub(GpdbDatabase).refresh.with_any_args { true }
  end


  get "/gpdb_instances/:gpdb_instance_id/databases" do
    parameter :gpdb_instance_id, "Id of the instance to get the list of databases"

    example_request "Get a list of databases" do
      status.should == 200
    end
  end

end
