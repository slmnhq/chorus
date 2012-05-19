require 'spec_helper'

describe DatabaseObjectsController do
  let(:user) { FactoryGirl.create :user}

  before do
    log_in user
  end

  context "#index" do
    it "should retrieve all db objects for a schema" do
      instance = FactoryGirl.create(:instance, :owner_id => user.id)
      instanceAccount = FactoryGirl.create(:instance_account, :instance_id => instance.id, :owner_id => user.id)

      database = FactoryGirl.create(:gpdb_database, :instance => instance, :name => "database1")
      schema = FactoryGirl.create(:gpdb_schema, :name => 'schema1', :database => database)
      table = FactoryGirl.build_stubbed(:gpdb_table, :name => 'table1')
      view = FactoryGirl.build_stubbed(:gpdb_view, :name => 'view1')

      stub(GpdbDatabaseObject).refresh(instanceAccount, schema) { [table, view] }

      get :index, :schema_id => schema.to_param

      response.code.should == "200"
      decoded_response.length.should == 2

      decoded_response[0].id.should == table.id
      decoded_response[1].id.should == view.id
    end
  end
end
