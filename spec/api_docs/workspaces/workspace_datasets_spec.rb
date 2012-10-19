require 'spec_helper'

resource "Workspaces" do
  let(:user) { users(:owner) }
  let(:gpdb_table) { datasets(:source_table) }
  let(:workspace) { workspaces(:public) }
  let(:workspace_id) { workspace.id }
  let(:id) { gpdb_table.id }

  before do
    log_in user
    stub(Dataset).refresh.with_any_args { |account, schema, options| schema.datasets }
  end

  get "/workspaces/:workspace_id/datasets" do
    parameter :workspace_id, "Id of a workspace"

    required_parameters :workspace_id
    pagination

    example_request "Get a list of datasets associated with a workspace" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/datasets/:id" do
    parameter :workspace_id, "Id of a workspace"
    parameter :id, "Id of a dataset"

    required_parameters :workspace_id, :id

    let(:id) { datasets(:table).id }

    example_request "Get details for a dataset" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/datasets" do
    parameter :workspace_id, "Id of the workspace with which to associate the datasets"
    parameter :dataset_ids, "Comma-delimited list of dataset Ids to associate with the workspace"

    required_parameters :workspace_id, :dataset_ids

    before do
      workspace.sandbox = gpdb_schemas(:searchquery_schema)
      workspace.save
    end

    let(:view) { datasets(:view) }
    let(:table) { datasets(:table) }
    let(:dataset_ids) { view.to_param + "," + table.to_param }

    example_request "Associate a list of non-sandbox datasets with the workspace" do
      status.should == 201
    end
  end

  delete "/workspaces/:workspace_id/datasets/:id" do
    parameter :workspace_id, "Id of a workspace"
    parameter :id, "Id of a dataset to be disassociated with the workspace"

    required_parameters :workspace_id, :id
    example_request "Disassociate a non-sandbox dataset from a workspace" do
      status.should == 200
    end
  end
end
