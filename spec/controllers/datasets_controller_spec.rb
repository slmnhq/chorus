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
    it "should retrieve the db object for a schema" do
      get :show, :id => table.to_param

      response.code.should == "200"
      decoded_response.object_name.should == table.name
      decoded_response.object_type.should == "TABLE"
    end

    generate_fixture "dataset.json" do
      get :show, :id => table.to_param
    end
  end

  def call_sql(schema, account, sql_command)
    schema.with_gpdb_connection(account) do |connection|
      connection.exec_query(sql_command)
    end
  end

  describe "#import", :database_integration => true do
    let(:account) { real_gpdb_account }
    let(:schema) { GpdbSchema.find_by_name('test_schema') }
    let(:archived_workspace) { workspaces(:archived) }
    let(:active_workspace) { workspaces(:bob_public) }
    let(:src_table) { GpdbTable.find_by_name('base_table1') }
    let(:options) {
      {
              "to_table" => "the_new_table",
              "use_limit_rows" => "false",
              "sample_count" => 0,
              "workspace_id" => active_workspace.id
      }
    }

    before(:each) do
      log_in account.owner
      refresh_chorus
      any_instance_of(DatasetsController) { |c| mock.proxy(c).import }
    end

    after(:each) do
      call_sql(schema, account, "DROP TABLE IF EXISTS the_new_table")
    end

    it "should return successfully for active workspaces" do
      post :import, :id => src_table.to_param, "dataset_import" => options

      GpdbTable.refresh(account, schema)
      response.code.should == "201"
    end

    it "should return error for archived workspaces" do
      options[:workspace_id] = archived_workspace.id
      post :import, :id => src_table.to_param, "dataset_import" => options

      GpdbTable.refresh(account, schema)
      response.code.should == "422"
    end
  end
end