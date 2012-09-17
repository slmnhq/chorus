require 'spec_helper'

resource "Chorus Views" do
  let(:dataset) { datasets(:bobs_table) }
  let(:owner) { users(:bob) }
  let(:workspace) { workspaces(:bob_public) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :gpdb_instance => dataset.gpdb_instance, :owner => owner) }
  let(:dataset_id) { dataset.id }

  before do
    log_in owner
  end

  post "/chorus_views" do
    before do
      any_instance_of(GpdbSchema) do |schema|
        mock(schema).with_gpdb_connection.with_any_args
      end
    end

    parameter :source_object_id, "Id of the source dataset/workfile"
    parameter :source_object_type, "'dataset' or 'workfile'"
    parameter :object_name, "Name of the Chorus View to be created"
    parameter :schema_id, "Id of the schema to run the view in"
    parameter :workspace_id, "Id of the workspace the Chorus View belongs to"
    parameter :query, "Sql statement of the Chorus View, must start with SELECT or WITH"

    required_parameters :source_object_id, :source_object_type, :object_name, :schema_id, :workspace_id, :query

    scope_parameters :chorus_view, :all

    let(:source_object_id) { dataset_id }
    let(:source_object_type) { "dataset" }
    let(:workspace_id) { workspace.id }
    let(:object_name) {"MyChorusView"}
    let(:schema_id) {workspace.sandbox.id}
    let(:query) {"select 1;"}

    example_request "Create a Chorus View" do
      status.should == 201
    end
  end

  put "/workspaces/:workspace_id/datasets/:id" do
    before do
      any_instance_of(GpdbSchema) do |schema|
        mock(schema).with_gpdb_connection.with_any_args
      end
    end

    parameter :workspace_id, "Id of the workspace the Chorus View belongs to"
    parameter :id, "Id of the chorus view to update"
    parameter :query, "Sql statement of the Chorus View, must start with SELECT or WITH"

    scope_parameters :workspace_dataset, :all

    required_parameters :id, :workspace_id, :query

    let(:workspace_id) { workspace.id }
    let(:query) {"select 1;"}
    let!(:chorus_view) { datasets(:bob_chorus_view) }
    let(:id) { chorus_view.id }

    example_request "Update a Chorus View" do
      status.should == 200
    end
  end

  post "/datasets/preview_sql" do
    let(:sql_result) {
      SqlResult.new.tap do |r|
        r.add_column("t_bit", "bit")
        r.add_rows([["10101"]])
        r.schema = schema
      end
    }

    before do
      mock(SqlExecutor).execute_sql.with_any_args { sql_result }
    end

    parameter :schema_id, "Id of the corresponding schema"
    parameter :query, "Sql of the chorus view"
    parameter :check_id, "Unique token"

    scope_parameters :task, :all

    required_parameters :schema_id, :query, :check_id

    let(:schema) { gpdb_schemas(:bobs_schema) }
    let(:schema_id) { schema.id }
    let(:query) { "SELECT * FROM bobs_table;" }
    let(:check_id) {'0.43214321' }

    example_request "Preview a Chorus View" do
      status.should == 200
    end
  end
end