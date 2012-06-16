require 'spec_helper'

resource "Greenplum DB schemas" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:owned_instance) { FactoryGirl.create :instance, :owner => owner }
  let!(:database) { FactoryGirl.create :gpdb_database, :instance => owned_instance }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => owned_instance, :owner => owner)}

  let(:db_schema) { FactoryGirl.create(:gpdb_schema, :database => database) }
  let(:id) { db_schema.to_param }
  let(:schema_id) { db_schema.to_param }
  let(:table) { FactoryGirl.create(:gpdb_table, :name => "table1", :schema => db_schema) }
  let(:view) { FactoryGirl.create(:gpdb_view, :name => "view1", :schema => db_schema) }

  before do
    log_in owner
    stub(GpdbSchema).refresh(owner_account, database) { [db_schema] }
    stub(Dataset).refresh(owner_account, db_schema) { [table, view] }
    stub(Dataset).add_metadata!(anything, owner_account)
  end

  get "/schemas/:id" do
    example_request "Get a specific schema" do
      status.should == 200
    end
  end

  get "/schemas/:schema_id/database_objects" do
    example_request "Get the list of database objects for a specific schema" do
      status.should == 200
    end
  end
end
