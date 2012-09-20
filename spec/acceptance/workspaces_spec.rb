require 'spec_helper'

resource "Workspaces" do
  let(:workspace) { workspaces(:api) }
  let(:workspace_id) { workspace.to_param }
  let(:id) { workspace_id }
  let(:user) { workspace.owner }

  let(:hadoop_instance) { FactoryGirl.create(:hadoop_instance, :owner => user) }
  let(:greenplum_instance) { FactoryGirl.create(:greenplum_instance, :owner => user) }
  let!(:database) { FactoryGirl.create(:gpdb_database, :gpdb_instance => greenplum_instance) }
  let!(:sandbox) { FactoryGirl.create(:gpdb_schema, :database => database) }
  let!(:instance_account) { FactoryGirl.create(:instance_account, :owner => user, :gpdb_instance => sandbox.gpdb_instance) }
  let(:dataset) { FactoryGirl.create(:gpdb_table) }
  let!(:associated_dataset) { FactoryGirl.create(:associated_dataset, :dataset => dataset, :workspace => workspace) }

  before do
    log_in user
    stub(HdfsExternalTable).execute_query.with_any_args { nil }
    stub(File).readlines.with_any_args { ["The river was there."] }
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
    scope_parameters :workspace, :all

    let(:name) { "Awesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "I like big data and I cannot lie, all the other coders can't deny" }
    let(:sandbox_id) { sandbox.id }

    example_request "Update workspace details" do
      status.should == 200
    end
  end

  put "/workspaces/:id" do
    parameter :name, "Workspace name"
    parameter :public, "1 if the workspace should be public, 0 if it should be private. Defaults to public if the parameter is not provided."
    parameter :summary, "Notes about the workspace"
    parameter :instance_id, "id of instance to create database in"
    parameter :database_name, "name of a new database"
    parameter :schema_name, "Name of new schema"

    required_parameters :name
    scope_parameters :workspace, :all

    let(:name) { "Awesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "I like big data and I cannot lie, all the other coders can't deny" }
    let(:database_name) { "new_database_name" }
    let(:instance_id) { greenplum_instance.id }

    example_request "Add a sandbox by creating a new schema in a new database" do
      status.should == 200
    end
  end

  put "/workspaces/:id" do
    parameter :name, "Workspace name"
    parameter :public, "1 if the workspace should be public, 0 if it should be private. Defaults to public if the parameter is not provided."
    parameter :summary, "Notes about the workspace"
    parameter :database_id, "id of a database"
    #parameter :schema_name, "Name of new schema"

    required_parameters :name
    scope_parameters :workspace, :all

    let(:name) { "Awesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "I like big data and I cannot lie, all the other coders can't deny" }
    let(:database_id) { database.id }
    #let(:schema_name) { "new_schema_name" }

    example_request "Add a sandbox by creating a new schema in an existing database" do
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

  post "/workspaces/:workspace_id/datasets/:dataset_id/import" do
    let(:workspace) { workspaces(:public) }

    parameter :dataset_id, "Id of the source dataset"
    parameter :to_table, "Table name of the destination table"
    parameter :truncate, "not implemented yet! True/false: truncate into existing table (only if new_table is false)"
    parameter :new_table, "True/false: if true, import into new table. Otherwise, import into existing table."
    parameter :is_active, "True/false: if true, import schedule is active"
    parameter :import_type, "not yet implemented (currently oneTime)"
    parameter :sample_count, "Maximum number of rows to import"

    required_parameters :dataset_id, :to_table, :new_table

    scope_parameters :dataset_import, :all

    let(:dataset_id) { datasets(:table).id }
    let(:to_table) { "fancyTable" }
    let(:truncate) { "false" }
    let(:new_table) { "true" }
    let(:is_active) { "false" }
    let(:import_type) { "oneTime" }
    let(:sample_count) { "500" }
    let!(:statistics) { FactoryGirl.build(:dataset_statistics) }

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
    let(:workspace) { workspaces(:public) }

    parameter :dataset_id, "Id of the source dataset"
    parameter :id, "id of the import schedule"
    parameter :to_table, "Table name of the destination table"
    parameter :truncate, "not implemented yet! True/false: truncate into existing table (only if new_table is false)"
    parameter :new_table, "True/false: if true, import into new table. Otherwise, import into existing table."
    parameter :is_active, "True/false: if true , the schedule is active"
    parameter :import_type, "not yet implemented (currently oneTime)"
    parameter :sample_count, "Maximum number of rows to import"

    required_parameters :dataset_id, :to_table, :new_table

    scope_parameters :dataset_import, :all

    let(:dataset_id) { datasets(:table).id }
    let(:to_table) { "fancyTable" }
    let(:truncate) { "false" }
    let(:new_table) { "true" }
    let(:is_active) { "true" }
    let(:import_type) { "oneTime" }
    let(:sample_count) { "500" }
    let(:id) { import_schedules(:default).id }
    let!(:statistics) { FactoryGirl.build(:dataset_statistics) }

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
    let!(:dataset_id) { dataset.to_param }

    parameter :workspace_id, "Id of the workspace that the dataset belongs to"
    parameter :dataset_id, "Id of the dataset"
    parameter :id, "id of the import schedule"
    scope_parameters :dataset_import, :all

    required_parameters :dataset_id , :id , :workspace_id
    let(:id) { import_schedules(:bob_schedule).id }

    example_request "Delete import schedule for a dataset" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/external_tables" do
    parameter :hdfs_entry_id, "Id of the source HDFS entry"
    parameter :has_header, "'true' if data contains a header column, 'false' otherwise", :scope => :hdfs_external_table
    parameter :column_names, "Array of column names", :scope => :hdfs_external_table
    parameter :types, "Array of column types", :scope => :hdfs_external_table
    parameter :delimiter, "Delimiter (i.e. , or ;)", :scope => :hdfs_external_table
    parameter :table_name, "Name of the table to be created", :scope => :hdfs_external_table
    parameter :workspace_id, "Id of the workspace to create the table in"

    required_parameters :hdfs_entry_id, :table_name, :workspace_id, :column_names, :delimiter, :types
    scope_parameters :hdfs_external_table, [:hdfs_entry_id, :has_header, :column_names, :column_types, :delimiter, :table_name]

    let(:hdfs_entry_id) { hadoop_instance.hdfs_entries.create!(path: "/files/data.csv").id }
    let(:has_header) { true }
    let(:column_names) { ["field1", "field2"] }
    let(:types) { ["text", "text"] }
    let(:delimiter) { ',' }
    let(:table_name) { "highway_to_heaven" }

    before do
      workspace.sandbox = sandbox
      workspace.save!
    end

    example_request "Create external table from CSV file on hadoop" do
      status.should == 200
    end
  end

  post "/workspaces/:workspace_id/datasets" do
    parameter :workspace_id, "ID of the workspace with which to associate the datasets"
    parameter :dataset_ids, "Comma-delimited list of dataset IDs to associate with the workspace"

    before do
      workspace.sandbox = sandbox
      workspace.save
    end

    let(:view) { FactoryGirl.create(:gpdb_view) }
    let(:table) { FactoryGirl.create(:gpdb_table) }
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

  put "/workspaces/:workspace_id/csv/:id/import" do
    parameter :workspace_id, "Workspace Id"
    parameter :id, "CSV File Id"
    parameter :type, "Table type ( existingTable, newTable )"
    parameter :columns_map, "Mapping of columns from CSV to table ( only for existing table )"
    parameter :to_table, "Target table name"
    parameter :file_contains_header, "Does the CSV file contain a header row? ( true, false )"

    required_parameters :workspace_id, :id, :type, :to_table, :file_contains_header
    scope_parameters :csvimport, [:type, :columns_map, :to_table, :file_contains_header]

    let(:csv_file) { CsvFile.last }

    let(:id)           { csv_file.id}
    let(:type)         { "existingTable"}
    let(:to_table)     { "a_fine_table" }
    let(:file_contains_header) { "true" }
    let(:columns_map) { '[{"sourceOrder":"id","targetOrder":"id"},{"sourceOrder":"boarding_area","targetOrder":"boarding_area"},{"sourceOrder":"terminal","targetOrder":"terminal"}]' }

    example_request "Import a CSV file" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/image" do
    parameter :style, "Size of image ( original, icon )"

    example_request "Show workspace image" do
      status.should == 200
    end
  end
end