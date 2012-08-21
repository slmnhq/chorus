require 'spec_helper'

resource "Workfiles" do
  let!(:owner) { users(:bob) }
  let!(:workspace) { FactoryGirl.create(:workspace, :owner => owner) }
  let!(:workfile) { FactoryGirl.create(:workfile, :owner => owner, :workspace => workspace, :file_name => 'test.sql') }
  let!(:file) { test_file("workfile.sql", "text/sql") }
  let!(:workfile_id) { workfile.to_param }
  let(:result) { }

  before do
    log_in owner
    stub(SqlExecutor).execute_sql.with_any_args { result }
    stub(SqlExecutor).cancel_query.with_any_args { }
  end

  get "/workfiles/:id" do
    let(:id) { workfile.to_param }

    example_request "Show workfile details" do
      status.should == 200
    end
  end

  get "/workfiles/:workfile_id/download" do
    before do
      FactoryGirl.create(:workfile_version, :owner => owner, :workfile => workfile, :contents => file)
    end

    parameter :workfile_id, "Workfile to download"

    required_parameters :workfile_id

    let(:workspace_id) { workspace.to_param }

    example_request "Downloads the file content" do
      status.should == 200
    end
  end

  post "/workfiles/:workfile_id/copy" do
    before do
      FactoryGirl.create(:workfile_version, :owner => owner, :workfile => workfile, :contents => file)
    end

    parameter :workfile_id, "Workfile to copy"
    parameter :workspace_id, "Workspace to copy to"

    required_parameters :workfile_id, :workspace_id

    let(:workspace_id) { workspace.to_param }

    example_request "Copy a workfile to a workspace" do
      status.should == 201
    end
  end

  delete "/workfiles/:id" do
    let(:id) { workfile.to_param }
    parameter :id, "ID of the workfile to delete"
    required_parameters :id

    example_request "Delete the specified workfile" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/workfiles" do
    let(:workspace_id) { workspace.to_param }

    example_request "Lists workfiles on a workspace" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/workfiles" do
    let(:workspace_id) { workspace.to_param }

    parameter :owner_id, "Workfile owner"
    parameter :description, "Workfile description"
    parameter :file_name, "Filename"

    required_parameters :file_name
    scope_parameters :workfile, :all

    let(:owner_id) { owner.to_param }
    let(:description) { "Get off my lawn, you darn kids!" }
    let(:file_name) { workfile.file_name }

    example_request "Create a workfile on a workspace" do
      status.should == 200
    end
  end

  post "/workfiles/:workfile_id/executions" do
    parameter :schema_id, "Schema Id"
    parameter :workfile_id, "Workfile Id"
    parameter :check_id, "Check Id to cancel the execution"
    parameter :sql, "Sql to execute"

    required_parameters :workfile_id, :schema_id, :check_id

    let(:schema_id) { gpdb_schemas(:bobs_schema).id }
    let(:check_id) { "12345" }

    let(:result) do
      SqlResult.new.tap do |r|
        r.add_column("results_of", "your_sql")
      end
    end


    example_request "Executes a workfile" do
      status.should == 200
    end
  end

  delete "/workfiles/:workfile_id/executions/:id" do
    parameter :schema_id, "Schema ID"
    parameter :workfile_id, "Workfile Id"
    parameter :id, "Check Id (given when starting the execution)"

    required_parameters :id, :workfile_id, :schema_id

    let(:id) { 0 }
    let(:schema_id) { gpdb_schemas(:bobs_schema).id }

    example_request "Cancels execution of a workfile" do
      status.should == 200
    end
  end
end
