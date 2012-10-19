require 'spec_helper'

resource "Greenplum DB: schemas" do
  let(:owner) { owned_instance.owner }
  let!(:owned_instance) { gpdb_instances(:owners) }
  let!(:database) { gpdb_databases(:default) }
  let!(:owner_account) { owned_instance.account_for_user(owner) }

  let(:db_schema) { gpdb_schemas(:default)}
  let(:id) { db_schema.to_param }
  let(:schema_id) { db_schema.to_param }
  let(:table) { datasets(:table) }
  let(:view) { datasets(:view) }

  let(:default_dataset_refresh_options) { { :sort => [{:relname => 'asc'}] } }

  before do
    log_in owner
    stub(GpdbSchema).refresh(owner_account, database) { [db_schema] }
    stub(Dataset).refresh(owner_account, db_schema, default_dataset_refresh_options) { [table, view] }
    stub(Dataset).add_metadata!(anything, owner_account)
    any_instance_of(GpdbSchema) do |schema|
      stub(schema).verify_in_source
      stub(schema).stored_functions(owner_account) {
        [ GpdbSchemaFunction.new(
          db_schema.name,
          "test_function",
          "SQL",
          "text",
          "{number, other}",
          "{int4,int4}",
          "select pg_sleep(100)",
          "does nothing. do not call."
        )]
      }
    end
  end

  get "/schemas/:id" do
    parameter :id, "Greenplum schema id"
    example_request "Get a specific schema" do
      status.should == 200
    end
  end

  get "/schemas/:schema_id/datasets" do
    parameter :schema_id, "Greenplum schema id"
    pagination

    example_request "Get the list of database objects for a specific schema" do
      status.should == 200
    end
  end

  get "/schemas/:schema_id/functions" do
    parameter :schema_id, "Greenplum schema id"
    pagination

    example_request "List the functions in a schema" do
      status.should == 200
    end
  end
end
