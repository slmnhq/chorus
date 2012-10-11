require 'spec_helper'

resource "Workspaces" do
  let(:workspace) { workspaces(:public) }
  let(:workspace_id) { workspace.to_param }
  let(:id) { workspace_id }
  let(:user) { workspace.owner }

  let(:dataset) { datasets(:table) }
  let(:sandbox) { dataset.schema }
  let(:sandbox_id) { sandbox.id }
  let(:database) { sandbox.database }
  let(:database_id) { database.id }
  let(:greenplum_instance) { database.gpdb_instance}
  let(:instance_id) { greenplum_instance.id }
  let(:instance_account) { greenplum_instance.account_for_user!(user) }
  let(:dataset_id) { dataset.to_param }
  let(:associated_dataset) { AssociatedDataset.find_by_dataset_id_and_workspace_id(dataset_id, workspace_id) }
  let(:hadoop_instance) { hadoop_instances(:hadoop) }

  before do
    log_in user
    stub(File).readlines.with_any_args { ["The river was there."] }
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
    example_request "Show workspace details" do
      status.should == 200
    end
  end

  put "/workspaces/:id" do
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

  put "/workspaces/:id" do
    parameter :instance_id, "id of instance to create database in"
    parameter :database_id, "id of a database"
    parameter :schema_name, "Name of new schema"

    required_parameters :instance_id
    required_parameters :database_id
    required_parameters :schema_name

    let(:greenplum_instance) { GpdbIntegration.real_gpdb_instance }
    let(:database) { greenplum_instance.databases.first }
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

  post "/workspaces/:workspace_id/csv/:csv_id/imports" do
    parameter :workspace_id, "Workspace Id"
    parameter :csv_id, "CSV File Id"
    parameter :type, "Table type ( existingTable, newTable )"
    parameter :columns_map, "Mapping of columns from CSV to table ( only for existing table )"
    parameter :to_table, "Target table name"
    parameter :file_contains_header, "Does the CSV file contain a header row? ( true, false )"

    required_parameters :workspace_id, :csv_id, :type, :to_table, :file_contains_header
    scope_parameters :csvimport, [:type, :columns_map, :to_table, :file_contains_header]

    let(:csv_file) { csv_files(:default) }

    let(:csv_id)       { csv_file.id }
    let(:type)         { "existingTable" }
    let(:to_table)     { "a_fine_table" }
    let(:file_contains_header) { "true" }
    let(:columns_map) { '[{"sourceOrder":"id","targetOrder":"id"},{"sourceOrder":"boarding_area","targetOrder":"boarding_area"},{"sourceOrder":"terminal","targetOrder":"terminal"}]' }

    example_request "Complete import of a CSV file" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/image" do
    let(:workspace) { workspaces(:image) }
    parameter :style, "Size of image ( original, icon )"

    example_request "Show workspace image" do
      status.should == 200
    end
  end
end