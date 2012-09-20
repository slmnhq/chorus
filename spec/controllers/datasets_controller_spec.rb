require 'spec_helper'

describe DatasetsController do
  let(:user) { users(:the_collaborator) }
  let(:instance_account) { gpdb_instance.account_for_user!(user) }
  let(:gpdb_instance) { gpdb_instances(:owners) }
  let(:datasets_sql) { Dataset::Query.new(schema).tables_and_views_in_schema(options).to_sql }
  let(:database) { gpdb_instance.databases.first }
  let(:schema) { gpdb_schemas(:default) }
  let(:table) { schema.datasets.tables.first }
  let(:dataset) { datasets(:table) }
  let(:view) { schema.datasets.views.first }

  before do
    log_in user
  end

  context "#index" do
    before do
      stub_gpdb(instance_account, datasets_sql => [
          {'type' => "v", "name" => "new_view", "master_table" => 'f'},
          {'type' => "r", "name" => "new_table", "master_table" => 't'},
          {'type' => "r", "name" => dataset.name, "master_table" => 't'}
      ])
      stub(table).add_metadata!(instance_account)
    end
    context "without any filter " do
      let(:options) { {:sort => [{:relname => 'asc'}]} }
      it "should retrieve authorized db objects for a schema" do
        get :index, :schema_id => schema.to_param

        response.code.should == "200"
        decoded_response.length.should == 3
        decoded_response.map(&:object_name).should match_array(['table', 'new_table', 'new_view'])
        schema.datasets.size > decoded_response.size #Testing that controller shows a subset of datasets
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
        # stub checks for valid SQL with sorting
      end
    end
    context "with filter" do
      let(:options) { {:filter => [{:relname => 'view'}], :sort => [{:relname => 'asc'}]} }
      it "should filter db objects by name" do
        get :index, :schema_id => schema.to_param, :filter => 'view'
        # stub checks for valid SQL with sorting and filtering
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

end