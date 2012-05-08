require 'spec_helper'

describe SchemasController do
  context "#index" do
    let!(:user) { FactoryGirl.create :user}

    before do
      log_in user
    end

    it "should retrieve all schemas for a database" do
      instance = FactoryGirl.create(:instance, :owner_id => user.id)
      instanceAccount = FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id)

      schema1 = Schema.new('schema1', instance.id, 'test2', 30)
      schema2 = Schema.new('schema2', instance.id, 'test2', 40)
      stub(Schema).from_instance_account_and_db(instanceAccount, "test2") { [schema1, schema2] }

      get :index, :instance_id => instance.id, :database_id => "test2"
      response.code.should == "200"
      decoded_response.length.should == 2
      decoded_response[0].name.should == "schema1"
      decoded_response[0].instance_id.should == instance.id
      decoded_response[0].database_name.should == "test2"
      decoded_response[0].dataset_count.should == 30
      decoded_response[1].name.should == "schema2"
      decoded_response[1].instance_id.should == instance.id
      decoded_response[1].database_name.should == "test2"
      decoded_response[1].dataset_count.should == 40
    end
  end
end