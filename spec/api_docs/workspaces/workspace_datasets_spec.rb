require 'spec_helper'

resource "Workspaces" do
  let(:user) { users(:owner) }
  let(:gpdb_table) { datasets(:source_table) }
  let(:workspace) { workspaces(:public)}
  let(:workspace_id) { workspace.id }
  let(:id) { gpdb_table.id }

  before do
    log_in user
    stub(Dataset).refresh.with_any_args { |account, schema, options| schema.datasets }
  end

  get "/workspaces/:workspace_id/datasets" do
    pagination

    example_request "Get a list of datasets associated with a workspace" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/datasets" do
    parameter :workspace_id, "ID of the workspace with which to associate the datasets"
    parameter :dataset_ids, "Comma-delimited list of dataset IDs to associate with the workspace"

    before do
      workspace.sandbox = gpdb_schemas(:searchquery_schema)
      workspace.save
    end

    let(:view) { datasets(:view) }
    let(:table) { datasets(:table) }
    let(:dataset_ids) { view.to_param + "," + table.to_param }

    example_request "Associate the specified non-sandbox datasets with the workspace" do
      status.should == 201
    end
  end

  delete "/workspaces/:workspace_id/datasets/:id" do
    example_request "Disassociate a non-sandbox dataset from a workspace" do
      status.should == 200
    end
  end
end
