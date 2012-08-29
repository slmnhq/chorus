require 'spec_helper'

resource "Greenplum DB account sharing" do
  let!(:owner) { users(:alice) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :gpdb_instance => gpdb_instance, :owner => owner)}
  let!(:gpdb_instance) { FactoryGirl.create(:gpdb_instance, :owner => owner, :shared => shared) }
  let(:gpdb_instance_id) { gpdb_instance.to_param }

  before do
    log_in owner
  end

  post "/gpdb_instances/:gpdb_instance_id/sharing" do
    let(:shared) { false }

    example_request "Make instance shared" do
      status.should == 201
    end
  end

  delete "/gpdb_instances/:gpdb_instance_id/sharing" do
    let(:shared) { true }

    example_request "Require individual accounts" do
      status.should == 200
    end
  end
end
