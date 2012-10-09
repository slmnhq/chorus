require 'spec_helper'

resource "Greenplum Database" do
  let(:owner) { users(:owner) }
  let(:owned_instance) { gpdb_instances(:owners) }
  let(:database) { gpdb_databases(:default) }
  let(:owner_account) { owned_instance.owner_account }
  let(:id) { database.to_param }
  let(:database_id) { database.to_param }

  let(:db_schema_1) { gpdb_schemas(:default) }
  let(:db_schema_2) { gpdb_schemas(:public) }

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
