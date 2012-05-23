require 'spec_helper'

describe SchemasController do
  let(:user) { FactoryGirl.create :user}

  before do
    log_in user
  end

  context "#index" do
    it "should retrieve all schemas for a database" do
      instance = FactoryGirl.create(:instance, :owner_id => user.id)
      instanceAccount = FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id)

      database = FactoryGirl.create(:gpdb_database, :instance => instance, :name => "test2")

      schema1 = FactoryGirl.build(:gpdb_schema, :name => 'schema1', :database => database)
      FactoryGirl.create(:gpdb_table, :name => "table1", :schema => schema1)
      FactoryGirl.create(:gpdb_view, :name => "view1", :schema => schema1)
      schema1.reload

      schema2 = FactoryGirl.build(:gpdb_schema, :name => 'schema2', :database => database)
      FactoryGirl.create(:gpdb_table, :name => "table2", :schema => schema2)
      schema2.reload

      stub(GpdbSchema).refresh(instanceAccount, database) { [schema1, schema2] }

      get :index, :database_id => database.to_param

      response.code.should == "200"
      decoded_response.length.should == 2
      decoded_response[0].name.should == "schema1"
      decoded_response[0].instance_id.should == instance.id
      decoded_response[0].database_name.should == "test2"
      decoded_response[0].dataset_count.should == 2
      decoded_response[1].name.should == "schema2"
      decoded_response[1].instance_id.should == instance.id
      decoded_response[1].database_name.should == "test2"
      decoded_response[1].dataset_count.should == 1
    end
  end

  context "#show" do
    let(:schema) { FactoryGirl.create(:gpdb_schema)}

    before do
      stub(AccessPolicy).schemas_for(user) { GpdbSchema }
    end

    it "renders the schema" do
      get :show, :id => schema.to_param
      response.code.should == "200"
      decoded_response.id.should == schema.id
    end

    context "when an account can't be found" do
      before do
        stub(AccessPolicy).schemas_for(user) { GpdbSchema.where(:id => -1) }
      end

      it "returns 404" do
        get :show, :id => schema.to_param
        response.code.should == "404"
      end
    end

    context "when the schema can't be found" do
      it "returns 404" do
        get :show, :id => "-1"
        response.code.should == "404"
      end
    end
  end
end
