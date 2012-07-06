require 'spec_helper'

resource "Workspaces" do
  let!(:user) { FactoryGirl.create :admin }

  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :owner => user) }
  let(:greenplum_instance) { FactoryGirl.create(:greenplum_instance, :owner => user) }
  let!(:database) { FactoryGirl.create(:gpdb_database, :instance => greenplum_instance) }
  let!(:sandbox) { FactoryGirl.create(:gpdb_schema, :database => database) }
  let!(:workspace) { FactoryGirl.create :workspace, :owner => user }
  let!(:instance_account) { FactoryGirl.create(:instance_account, :owner => user, :instance => sandbox.instance) }
  let(:workspace_id) { workspace.to_param }
  let(:dataset) { FactoryGirl.create(:gpdb_table) }
  let!(:associated_dataset) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace) }

  before do
    log_in user
    stub(HdfsExternalTable).execute_query.with_any_args { nil }
  end

  get "/workspaces" do
    parameter :active, "1 if you only want active workspaces, 0 if you want all workspaces. Defaults to all workspaces if the parameter is not provided"
    parameter :user_id, "If provided, only return workspaces belonging to the specified user"

    example_request "Get a list of workspaces" do
      status.should == 200
    end
  end

  get "/workspaces/:id" do
    let(:id) { workspace.to_param }

    example_request "Show workspace details" do
      status.should == 200
    end
  end

  put "/workspaces/:id" do
    let(:id) { workspace.to_param }

    parameter :name, "Workspace name"
    parameter :public, "1 if the workspace should be public, 0 if it should be private. Defaults to public if the parameter is not provided."
    parameter :sandbox_id, "Id of the schema to be used as the workspace's sandbox"
    parameter :summary, "Notes about the workspace"

    required_parameters :name
    scope_parameters :workspace, :all

    let(:name) { "Awesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "I like big data and I cannot lie, all the other coders can't deny" }
    let(:sandbox_id) { sandbox.id }

    example_request "Update workspace details" do
      status.should == 200
    end
  end

  post "/workspaces" do
    parameter :name, "Workspace name"
    parameter :public, "1 if the workspace should be public, 0 if it should be private. Defaults to public if the parameter is not provided."
    parameter :summary, "Notes about the workspace"

    required_parameters :name
    scope_parameters :workspace, :all

    let(:name) { "Awesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "Lots of good data in here" }

    example_request "Create a workspace" do
      status.should == 201
    end
  end

  delete "/workspaces/:workspace_id/quickstart" do
    let(:workspace_id) { workspace.to_param }

    example_request "Dismiss the quickstart for a workspace" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/datasets/:id" do
    let(:id) { dataset.to_param }

    example_request "Show details for a dataset" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/datasets" do
    example_request "List datasets associated with a workspace" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/external_tables" do
    parameter :hadoop_instance_id, "Instance id of the hadoop instance", :scope => :hdfs_external_table
    parameter :pathname, "Pathname to the CSV file containing the table data", :scope => :hdfs_external_table
    parameter :has_header, "'true' if data contains a header column, 'false' otherwise", :scope => :hdfs_external_table
    parameter :column_names, "Array of column names", :scope => :hdfs_external_table
    parameter :types, "Array of column types", :scope => :hdfs_external_table
    parameter :delimiter, "Delimiter (i.e. , or ;)", :scope => :hdfs_external_table
    parameter :table_name, "Name of the table to be created", :scope => :hdfs_external_table
    parameter :workspace_id, "Id of the workspace to create the table in"

    scope_parameters :hdfs_external_table, [:hadoop_instance_id, :pathname, :has_header, :column_names, :column_types, :delimiter, :table_name]

    let(:hadoop_instance_id) { hadoop_instance.id }
    let(:pathname) { "foo_fighter/twisted_sisters/" }
    let(:has_header) { true }
    let(:column_names) { ["field1", "field2"] }
    let(:types) { ["text", "text"] }
    let(:delimiter) { ',' }
    let(:table_name) { "highway_to_heaven" }
    let(:workspace_with_sandbox) do
      workspace.sandbox = sandbox
      workspace.save
      workspace
    end

    let(:workspace_id) { workspace_with_sandbox.id }

    example_request "Create external table from CSV file on hadoop" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/datasets" do
    parameter :workspace_id, "ID of the workspace with which to associate the datasets"
    parameter :dataset_ids, "Array of dataset IDs to associate with the workspace"

    let(:workspace_with_sandbox) do
      workspace.sandbox = sandbox
      workspace.save
      workspace
    end

    let(:view) { FactoryGirl.create(:gpdb_view) }
    let(:workspace_id) { workspace_with_sandbox.id }
    let(:dataset_ids) { [view.to_param] }

    example_request "Associate the specified datasets with the workspace" do
      status.should == 201
    end
  end
end
