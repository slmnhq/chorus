require 'spec_helper'

resource "Greenplum Database" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:owned_instance) { FactoryGirl.create :instance, :owner => owner }
  let!(:database) { FactoryGirl.create :gpdb_database, :instance => owned_instance }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => owned_instance, :owner => owner)}
  let(:id) { database.to_param }
  let(:database_id) { database.to_param }

  let(:db_schema_1) { FactoryGirl.create(:gpdb_schema, :database => database) }
  let(:db_schema_2) { FactoryGirl.create(:gpdb_schema, :database => database) }

  before do
    log_in owner
    stub(GpdbSchema).refresh(owner_account, database) { [db_schema_1, db_schema_2] }
  end

  get "/databases/:id" do
    example_request "Get a specific database" do
      status.should == 200
    end
  end

  get "/databases/:database_id/schemas" do
    example_request "Get the list of schemas for a specific database" do
      status.should == 200
    end
  end
end
