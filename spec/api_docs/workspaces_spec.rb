require 'spec_helper'

resource "Workspaces" do
  let(:workspace) { workspaces(:public) }
  let(:workspace_id) { workspace.to_param }
  let(:id) { workspace_id }
  let(:user) { workspace.owner }

  let(:hadoop_instance) { hadoop_instances(:hadoop) }
  let(:greenplum_instance) { database.gpdb_instance}
  let(:instance_id) { greenplum_instance.id }
  let(:database) { workspace.sandbox.database }
  let(:database_id) { database.id }
  let(:sandbox) { dataset.schema }
  let(:sandbox_id) { sandbox.id }
  let(:instance_account) { greenplum_instance.account_for_user!(user) }
  let(:dataset) { datasets(:table) }
  let(:dataset_id) { dataset.to_param }
  let(:associated_dataset) { AssociatedDataset.find_by_dataset_id_and_workspace_id(dataset_id, workspace_id) }

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

    example_request "Show details for a dataset" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/datasets" do
    example_request "List datasets associated with a workspace" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/datasets/:dataset_id/import" do

    parameter :dataset_id, "Id of the source dataset"
    parameter :to_table, "Table name of the destination table"
    parameter :truncate, "not implemented yet! True/false: truncate into existing table (only if new_table is false)"
    parameter :new_table, "True/false: if true, import into new table. Otherwise, import into existing table."
    parameter :is_active, "True/false: if true, import schedule is active"
    parameter :import_type, "not yet implemented (currently oneTime)"
    parameter :sample_count, "Maximum number of rows to import"

    required_parameters :dataset_id, :to_table, :new_table


    let(:to_table) { "fancyTable" }
    let(:truncate) { "false" }
    let(:new_table) { "true" }
    let(:is_active) { "false" }
    let(:import_type) { "oneTime" }
    let(:sample_count) { "500" }
    let(:statistics) { FactoryGirl.build(:dataset_statistics) }

    before do
      any_instance_of(Dataset) do |dataset|
        stub(dataset).verify_in_source
        stub(dataset).add_metadata!.with_any_args { statistics }
        stub(dataset).statistics.with_any_args { statistics }
      end
    end

    example_request "Import an existing dataset into a workspace, or create an import for a dataset" do
      status.should == 201
    end
  end

  put "/workspaces/:workspace_id/datasets/:dataset_id/import" do

    parameter :dataset_id, "Id of the source dataset"
    parameter :id, "id of the import schedule"
    parameter :to_table, "Table name of the destination table"
    parameter :truncate, "not implemented yet! True/false: truncate into existing table (only if new_table is false)"
    parameter :new_table, "True/false: if true, import into new table. Otherwise, import into existing table."
    parameter :is_active, "True/false: if true , the schedule is active"
    parameter :import_type, "not yet implemented (currently oneTime)"
    parameter :sample_count, "Maximum number of rows to import"

    required_parameters :dataset_id, :to_table, :new_table


    let(:to_table) { "fancyTable" }
    let(:truncate) { "false" }
    let(:new_table) { "true" }
    let(:is_active) { "true" }
    let(:import_type) { "oneTime" }
    let(:sample_count) { "500" }
    let(:id) { import_schedules(:default).id }
    let(:statistics) { FactoryGirl.build(:dataset_statistics) }

    before do
      any_instance_of(Dataset) do |dataset|
        stub(dataset).verify_in_source
        stub(dataset).add_metadata!.with_any_args { statistics }
        stub(dataset).statistics.with_any_args { statistics }
      end
    end

    example_request "Update an import for a dataset" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/datasets/:dataset_id/import" do
    let!(:dataset_id) { dataset.to_param }

    parameter :workspace_id, "Id of the workspace that the dataset belongs to"
    parameter :dataset_id, "Id of the dataset"

    before do
        ImportSchedule.create!(
          :start_datetime => '2012-09-04 23:00:00-07',
          :end_date => '2012-12-04',
          :frequency => 'weekly',
          :workspace_id => workspace_id,
          :to_table => "new_table_for_import",
          :source_dataset_id => dataset_id,
          :truncate => 't',
          :new_table => 't',
          :user_id => user.id)

    end

    example_request "Show import schedule for a dataset" do
      status.should == 200
    end
  end

  delete "/workspaces/:workspace_id/datasets/:dataset_id/import" do

    parameter :workspace_id, "Id of the workspace that the dataset belongs to"
    parameter :dataset_id, "Id of the dataset"
    parameter :id, "id of the import schedule"

    required_parameters :dataset_id , :id , :workspace_id
    let(:id) { import_schedules(:default).id }

    example_request "Delete import schedule for a dataset" do
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

    example_request "Associate the specified datasets with the workspace" do
      status.should == 201
    end
  end

  post "/workspaces/:workspace_id/csv" do
    parameter :workspace_id, "ID of the workspace"
    parameter :file_name, "Name of the csv file to be imported"
    parameter :contents, "The csv file being imported"

    required_parameters :workspace_id, :file_name, :contents
    scope_parameters :csv, [:contents]

    let(:file_name) { "test.csv"}
    let(:contents) { Rack::Test::UploadedFile.new(File.expand_path("spec/fixtures/test.csv", Rails.root), "text/csv") }

    example_request "Upload a CSV file for import" do
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