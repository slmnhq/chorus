require 'spec_helper'

resource "Chorus Views" do
  let(:dataset) { datasets(:table) }
  let(:owner) { users(:owner) }
  let(:workspace) { workspaces(:public) }
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

  put "/chorus_views/:id" do
    before do
      any_instance_of(GpdbSchema) do |schema|
        mock(schema).with_gpdb_connection.with_any_args
      end
    end

    parameter :id, "Id of the chorus view to update"
    parameter :query, "Sql statement of the Chorus View, must start with SELECT or WITH"

    required_parameters :id, :query

    let(:query) {"select 1;"}
    let(:chorus_view) { datasets(:chorus_view) }
    let(:id) { chorus_view.id }

    example_request "Update a Chorus View" do
      status.should == 200
    end
  end

  delete "/chorus_views/:id" do
    parameter :id, "Id of the chorus view to update"

    required_parameters :id

    let(:chorus_view) { datasets(:chorus_view) }
    let(:id) { chorus_view.id }

    example_request "Delete a Chorus View" do
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

    required_parameters :schema_id, :query, :check_id

    let(:schema) { gpdb_schemas(:default) }
    let(:schema_id) { schema.id }
    let(:query) { "SELECT * FROM table;" }
    let(:check_id) {'0.43214321' }

    example_request "Preview a Chorus View" do
      status.should == 200
    end
  end
end