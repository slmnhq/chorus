require 'spec_helper'

describe DatasetsController do
  let(:user) { users(:carly) }
  let(:instance_account) { instance_accounts(:iamcarly) }
  let(:instance) { instance_account.instance }

  let(:database) { instance.databases.first }
  let(:schema) { gpdb_schemas(:bobs_schema) }
  let(:table) { schema.datasets.tables.first }
  let(:view) { schema.datasets.views.first }

  before do
    log_in user
  end

  context "#index" do
    before do
      mock(Dataset).refresh(instance_account, schema)
      stub(table).add_metadata!(instance_account)
    end

    it "should retrieve all db objects for a schema" do
      get :index, :schema_id => schema.to_param

      response.code.should == "200"
      decoded_response.length.should == 2

      decoded_response[0].id.should == table.id
      decoded_response[1].id.should == view.id
    end

    it "should not return db objects in another schema" do
      different_table = datasets(:other_table)
      get :index, :schema_id => schema.to_param
      decoded_response.map(&:id).should_not include different_table.id
    end

    it "should paginate results" do
      get :index, :schema_id => schema.to_param, :per_page => 1
      decoded_response.length.should == 1
    end

    it "should sort db objects by name" do
      get :index, :schema_id => schema.to_param
      decoded_response.first.object_name.downcase.should < decoded_response.second.object_name.downcase
    end

    it "should filter db objects by name" do
      get :index, :schema_id => schema.to_param, :filter => 'view'
      decoded_response.length.should >= 1
      decoded_response.each do |response|
        response.object_name.should =~ /view/
      end
    end
  end

  describe "#show" do
    before do
      any_instance_of(Dataset) { |dataset| stub(dataset).verify_in_source }
    end

    context "when dataset is valid in GPDB" do
      it "should retrieve the db object for a schema" do
        mock.proxy(Dataset).find_and_verify_in_source(table.id.to_s, user)

        get :show, :id => table.to_param

        response.code.should == "200"
        decoded_response.object_name.should == table.name
        decoded_response.object_type.should == "TABLE"
      end

      generate_fixture "dataset.json" do
        get :show, :id => table.to_param
      end
    end

    context "when dataset is not valid in GPDB" do
      it "should raise an error" do
        stub(Dataset).find_and_verify_in_source(table.id.to_s, user) { raise ActiveRecord::RecordNotFound.new }

        get :show, :id => table.to_param

        response.code.should == "404"
      end
    end
  end

  def call_sql(schema, account, sql_command)
    schema.with_gpdb_connection(account) do |connection|
      connection.exec_query(sql_command)
    end
  end

  describe "#import", :database_integration => true do
    let(:account) { GpdbIntegration.real_gpdb_account }
    let(:database) { GpdbDatabase.find_by_name_and_instance_id(GpdbIntegration.database_name, GpdbIntegration.real_gpdb_instance)}
    let(:schema) { database.schemas.find_by_name('test_schema') }
    let(:src_table) { database.find_dataset_in_schema('base_table1', 'test_schema') }
    let(:destination_table) { database.find_dataset_in_schema('the_new_table', 'test_schema') }
    let(:archived_workspace) { workspaces(:archived) }

    let(:options) {
      {
              "to_table" => "the_new_table",
              "use_limit_rows" => "false",
              "sample_count" => "0",
              "workspace_id" => active_workspace.id.to_s,
              "new_table" => "true",
              "truncate" => 'false'
      }
    }

    before(:each) do
      log_in account.owner
      refresh_chorus
    end

    after(:each) do
      call_sql(schema, account, "DROP TABLE IF EXISTS the_new_table")
    end

    context "into a table in the same database and instance" do
      let(:active_workspace) { Workspace.create!({:name => "TestImportWorkspace", :sandbox => schema, :owner => user}, :without_protection => true) }

      it "should return successfully for active workspaces" do
        any_instance_of(Dataset) { |c| mock(c).import(options, account.owner ) }
        post :import, :id => src_table.to_param, "dataset_import" => options

        GpdbTable.refresh(account, schema)

        response.code.should == "201"
        response.body.should == "{}"
      end

      it "should return error for archived workspaces" do
        options[:workspace_id] = archived_workspace.id
        post :import, :id => src_table.to_param, "dataset_import" => options

        GpdbTable.refresh(account, schema)
        response.code.should == "422"
      end
    end

    context "into a table in a different database" do
      let(:active_workspace) { workspaces(:bob_public) }

      before(:each) do
        any_instance_of(Dataset) { |c| mock(c).gpfdist_import(options, account.owner) }
      end

      it "should return successfully for active workspaces" do
        post :import, :id => src_table.to_param, "dataset_import" => options

        GpdbTable.refresh(account, schema)
        response.code.should == "201"
        response.body.should == "{}"
      end
    end

    context " existing table" do
      let(:active_workspace) { Workspace.create!({:name => "TestImportWorkspace", :sandbox => schema, :owner => user}, :without_protection => true) }
      before do
        options["new_table"] = "false"
      end

      it "throws an error if table does not exist" do
        post :import, :id => src_table.to_param, "dataset_import" => options
        response.code.should == "422"
      end

      it "throws an error if table structure is not consistent" do
        options["to_table"] = "master_table1"
        post :import, :id => src_table.to_param, "dataset_import" => options
        response.code.should == "422"
        decoded_errors.fields.base.TABLE_NOT_CONSISTENT.should be_present
      end
    end

  end
end