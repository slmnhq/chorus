require 'spec_helper'

describe FunctionsController do
  ignore_authorization!

  let(:user) { FactoryGirl.create :user}

  before do
    log_in user
  end

  describe "#index" do
    let(:instance) { FactoryGirl.create(:instance, :owner_id => user.id) }
    let(:instanceAccount) { FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id) }

    let(:database) { FactoryGirl.create(:gpdb_database, :instance => instance, :name => "database1") }
    let!(:schema) { FactoryGirl.create(:gpdb_schema, :name => 'schema1xx', :database => database) }

    before do
      stub(subject).gpdb_account_for_current_user(schema) { instanceAccount }
      any_instance_of(GpdbSchema) do |schema|
            mock(schema).stored_functions.with_any_args do
              [
                  GpdbSchemaFunction.new("a_schema", "ZOO", "sql", "text", nil, "{text}"),
                  GpdbSchemaFunction.new("a_schema", "hello", "sql", "int4", "{arg1, arg2}", "{text, int4}"),
                  GpdbSchemaFunction.new("a_schema", "foo", "sql", "text", "{arg1}", "{text}")
              ]
            end
          end
    end

    it "should list all the functions in the schema" do
      get :index, :schema_id => schema.to_param

      response.code.should == "200"
      decoded_response.length.should == 3

      decoded_response[0].schema_name.should == "a_schema"
      decoded_response[0].name.should == "ZOO"
      decoded_response[0].language.should == "sql"
      decoded_response[0].return_type.should == "text"
      decoded_response[0].arg_names.should == []
      decoded_response[0].arg_types.should == ["text"]
    end

    it "should check for permissions" do
      mock(subject).authorize! :show_contents, schema.instance
      get :index, :schema_id => schema.to_param
    end

    generate_fixture "schemaFunctionSet.json" do
      get :index, :schema_id => schema.to_param
    end

  end
end
