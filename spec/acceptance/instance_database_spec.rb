require 'spec_helper'

resource "Greenplum DB instances" do
  let!(:owner) { FactoryGirl.create :user }
  let(:instance) { FactoryGirl.create(:instance, :owner => owner) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => instance, :owner => owner)}
  let!(:database) { FactoryGirl.create(:gpdb_database, :instance => instance) }
  let!(:instance_id) {instance.to_param}

  before do
    log_in owner
    stub(GpdbDatabase).refresh.with_any_args { true }
  end


  get "/instances/:instance_id/databases" do
    parameter :instance_id, "Id of the instance to get the list of databases"

    example_request "Get a list of databases" do
      status.should == 200
    end
  end

end
