require 'spec_helper'

resource "Workspaces" do
  let(:workspace) { workspaces(:public) }
  let(:workspace_id) { workspace.to_param }
  let(:id) { workspace_id }
  let(:user) { workspace.owner }

  let(:greenplum_instance) { database.gpdb_instance}
  let(:instance_id) { greenplum_instance.id }
  let(:database) { workspace.sandbox.database }
  let(:database_id) { database.id }
  let(:sandbox) { dataset.schema }
  let(:sandbox_id) { sandbox.id }
  let(:dataset) { datasets(:table) }
  let(:dataset_id) { dataset.to_param }

  before do
    log_in user
    stub(Dataset).refresh.with_any_args { |account, schema, options| schema.datasets }
  end

  get "/workspaces" do
    parameter :active, "1 if you only want active workspaces, 0 if you want all workspaces. Defaults to all workspaces if the parameter is not provided"
    parameter :user_id, "If provided, only return workspaces belonging to the specified user"

    example_request "Get a list of workspaces" do
      status.should == 200
    end
  end

  get "/workspaces/:id" do
    example_request "Get details for a workspace" do
      status.should == 200
    end
  end

  put "/workspaces/:id" do
    parameter :name, "Workspace name"
    parameter :public, "1 if the workspace should be public, 0 if it should be private. Defaults to public if the parameter is not provided."
    parameter :sandbox_id, "Id of the schema to be used as the workspace's sandbox"
    parameter :summary, "Notes about the workspace"

    required_parameters :name

    let(:name) { "Awesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "I like big data and I cannot lie, all the other coders can't deny" }

    example_request "Update workspace details" do
      status.should == 200
    end
  end

  put "/workspaces/:id", :database_integration do
    parameter :instance_id, "id of instance to create database in"
    parameter :database_name, "name of a new database"
    parameter :schema_name, "Name of new schema"

    required_parameters :instance_id
    required_parameters :database_name
    required_parameters :schema_name

    let(:greenplum_instance) { GpdbIntegration.real_gpdb_instance }
    let(:database_name) { "a_new_database_name" }
    let(:schema_name) { "a_new_schema_name" }
    let(:user) { greenplum_instance.owner }

    after do
      Gpdb::ConnectionBuilder.connect!(greenplum_instance, greenplum_instance.owner_account) do |conn|
        conn.exec_query("DROP DATABASE IF EXISTS #{database_name};")
      end
    end

    example_request "Add a sandbox by creating a new schema in a new database" do
      status.should == 200
    end
  end

  put "/workspaces/:id", :database_integration do
    parameter :instance_id, "id of instance to create database in"
    parameter :database_id, "id of a database"
    parameter :schema_name, "Name of new schema"

    required_parameters :instance_id
    required_parameters :database_id
    required_parameters :schema_name

    let(:greenplum_instance) { GpdbIntegration.real_gpdb_instance }
    let(:database) { GpdbIntegration.real_database }
    let(:schema_name) { "a_new_schema" }
    let(:user) { greenplum_instance.owner }

    after do
      database.with_gpdb_connection(greenplum_instance.owner_account) do |conn|
        conn.exec_query("DROP SCHEMA IF EXISTS #{schema_name}")
      end
    end

    example_request "Add a sandbox by creating a new schema in an existing database" do
      status.should == 200
    end
  end

  put "/workspaces/:id" do
    parameter :sandbox_id, "id of schema that already exists"

    required_parameters :sandbox_id

    example_request "Add a sandbox schema that already exists" do
      status.should == 200
    end
  end

  post "/workspaces" do
    parameter :name, "Workspace name"
    parameter :public, "1 if the workspace should be public, 0 if it should be private. Defaults to public if the parameter is not provided."
    parameter :summary, "Notes about the workspace"

    required_parameters :name

    let(:name) { "Awesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "Lots of good data in here" }

    example_request "Create a workspace" do
      status.should == 201
    end
  end

  delete "/workspaces/:workspace_id/quickstart" do
    example_request "Dismiss the quickstart for a workspace" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/datasets/:id" do
    let(:id) { dataset_id }

    example_request "Get details for a dataset" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/external_tables" do
    parameter :hdfs_entry_id, "Id of the source HDFS entry"
    parameter :has_header, "'true' if data contains a header column, 'false' otherwise"
    parameter :'column_names[]', "Array of column names"
    parameter :'types[]', "Array of column types"
    parameter :delimiter, "Delimiter (i.e. , or ;)"
    parameter :table_name, "Name of the table to be created"
    parameter :workspace_id, "Id of the workspace to create the table in"

    required_parameters :hdfs_entry_id, :table_name, :workspace_id, :'column_names[]', :delimiter, :'types[]'

    let(:hdfs_entry_id) { hdfs_entries(:hdfs_file).id }
    let(:has_header) { true }
    let(:'column_names[]') { ["field1", "field2"] }
    let(:'types[]') { ["text", "text"] }
    let(:delimiter) { ',' }
    let(:table_name) { "highway_to_heaven" }

    before do
      workspace.update_attribute(:sandbox, sandbox)
      any_instance_of(Hdfs::ExternalTableCreator) do |instance|
        stub(instance).create_external_table {
          sandbox.datasets << FactoryGirl.create(:gpdb_table, :schema => sandbox, :name => table_name)
        }
      end
    end

    example_request "Create external table from CSV file on hadoop" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/image" do
    let(:workspace) { workspaces(:image) }
    parameter :style, "Size of image ( original, icon )"

    example_request "Get the workspace image" do
      status.should == 200
    end
  end
end