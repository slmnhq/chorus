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
    let(:src_table) { GpdbTable.find_by_name('base_table1') }
    let(:options) {
      {
              "to_table" => "the_new_table",
              "use_limit_rows" => "false",
              "sample_count" => 0
      }
    }

    before(:each) do
      log_in account.owner
      refresh_chorus
      post :import, :id => src_table.to_param, "dataset_import" => options
      GpdbTable.refresh(account, schema)
    end

    after(:each) do
      call_sql(schema, account, "DROP TABLE IF EXISTS the_new_table")
    end

    it "should return successfully" do
      response.code.should == "201"
    end

    it "creates the new table" do
      GpdbTable.find_by_name(options["to_table"]).should be_a(GpdbTable)
    end

    it "copies the constraints" do
      schema.with_gpdb_connection(account) do |connection|
        dest_constraints = connection.exec_query("SELECT constraint_type, table_name FROM information_schema.table_constraints WHERE table_name = '#{options["to_table"]}'")
        src_constraints = connection.exec_query("SELECT constraint_type, table_name FROM information_schema.table_constraints WHERE table_name = '#{src_table.name}'")

        dest_constraints.count.should == src_constraints.count
        dest_constraints.each_with_index do |constraint, i|
          constraint["constraint_type"].should == src_constraints[i]["constraint_type"]
          constraint["table_name"].should == options["to_table"]
        end
      end
    end

    it "copies the rows" do
      schema.with_gpdb_connection(account) do |connection|
        dest_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{options["to_table"]}")
        src_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{src_table.name}")

        dest_rows.count.should == src_rows.count
      end
    end

    context "when the rows are limited" do
      let(:options) {
        {
            "to_table" => "the_new_table",
            "use_limit_rows" => "true",
            "sample_count" => 5
        }
      }
      it "copies the rows up to limit" do
        schema.with_gpdb_connection(account) do |connection|
          dest_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{options["to_table"]}")
          dest_rows.count.should == 5
        end
      end

      context "when the row limit value is 0" do
        let(:options) {
          {
              "to_table" => "the_new_table",
              "use_limit_rows" => "true",
              "sample_count" => 0
          }
        }
        it "copies the table and ignores the row limit" do
          schema.with_gpdb_connection(account) do |connection|
            dest_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{options["to_table"]}")
            src_rows = connection.exec_query("SELECT * FROM #{schema.name}.#{src_table.name}")
            dest_rows.count.should == src_rows.count
          end
        end
      end
    end
  end

  describe "#import with exception", :database_integration => true do
    let(:account) { real_gpdb_account }
    let(:schema) { GpdbSchema.find_by_name('test_schema') }
    let(:src_table) { GpdbTable.find_by_name('base_table1') }
    let(:options) {
      {
          "to_table" => "the_new_table",
          "use_limit_rows" => "true",
          "sample_count" => -5
      }
    }

    before(:each) do
      log_in account.owner
      refresh_chorus
    end

    after(:each) do
      call_sql(schema, account, "DROP TABLE IF EXISTS the_new_table")
    end

    context "when the limit is -5" do
      it "raises an exception" do
        expect {
          post :import, :id => src_table.to_param, "dataset_import" => options
        }.to raise_error(SqlCommandFailed)
        GpdbTable.refresh(account, schema)
      end
    end
  end
end