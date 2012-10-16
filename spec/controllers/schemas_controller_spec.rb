require 'spec_helper'

describe SchemasController do
  ignore_authorization!

  let(:user) { users(:owner) }

  before do
    log_in user
  end

  context "#index" do
    let(:gpdb_instance) { gpdb_instances(:owners) }
    let(:database) { gpdb_databases(:default) }
    let(:schema1) { database.schemas[0] }
    let(:schema2) { database.schemas[1] }

    before do
      stub(GpdbSchema).refresh(gpdb_instance.account_for_user!(user), database) { [schema1, schema2] }
    end

    it "uses authorization" do
      mock(subject).authorize!(:show_contents, gpdb_instance)
      get :index, :database_id => database.to_param
    end

    it "should retrieve all schemas for a database" do
      get :index, :database_id => database.to_param

      response.code.should == "200"
      decoded_response.should have(2).items

      decoded_response[0].name.should == schema1.name
      decoded_response[0].database.instance.id.should == gpdb_instance.id
      decoded_response[0].database.name.should == schema1.database.name
      decoded_response[0].dataset_count.should == schema1.datasets_count

      decoded_response[1].name.should == schema2.name
      decoded_response[1].database.instance.id.should == gpdb_instance.id
      decoded_response[1].database.name.should == schema2.database.name
      decoded_response[1].dataset_count.should == schema2.datasets_count
    end

    it_behaves_like "a paginated list" do
      let(:params) {{ :database_id => database.to_param }}
    end

    generate_fixture "schemaSet.json" do
      get :index, :database_id => database.to_param
    end
  end

  context "#show" do
    let(:schema) { gpdb_schemas(:default) }
    before do
      any_instance_of(GpdbSchema) { |schema| stub(schema).verify_in_source }
    end

    it "uses authorization" do
      mock(subject).authorize!(:show_contents, schema.gpdb_instance)
      get :show, :id => schema.to_param
    end

    it "renders the schema" do
      get :show, :id => schema.to_param
      response.code.should == "200"
      decoded_response.id.should == schema.id
    end

    it "verifies the schema exists" do
      mock.proxy(GpdbSchema).find_and_verify_in_source(schema.id.to_s, user)
      get :show, :id => schema.to_param
      response.code.should == "200"
    end

    context "when the schema can't be found" do
      it "returns 404" do
        get :show, :id => "-1"
        response.code.should == "404"
      end
    end

    generate_fixture "schema.json" do
      get :show, :id => schema.to_param
    end

    context "when the schema is not in GPDB" do
      it "should raise an error" do
        stub(GpdbSchema).find_and_verify_in_source(schema.id.to_s, user) { raise ActiveRecord::RecordNotFound.new }

        get :show, :id => schema.to_param

        response.code.should == "404"
      end
    end
  end
end
