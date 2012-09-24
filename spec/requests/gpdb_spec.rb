require 'spec_helper'

describe "gpdb instances", :network => true do
  let(:valid_attributes) do
    {
        :name => "chorusgpdb42",
        :port => 5432,
        :host => GpdbIntegration::REAL_GPDB_HOST,
        :maintenance_db => "postgres",
        :db_username => GpdbIntegration::REAL_GPDB_USERNAME,
        :db_password => GpdbIntegration::REAL_GPDB_PASSWORD
    }
  end

  let!(:user) { FactoryGirl.create :user, :username => 'some_user', :password => 'secret' }

  context "after the user has logged in" do
    before do
      post "/sessions", :session => { :username => "some_user", :password => "secret" }
    end

    it "can be created" do
      post "/gpdb_instances", :instance => valid_attributes

      response.code.should == "201"
    end

    it "can be updated" do
      post "/gpdb_instances", :instance => valid_attributes
      gpdb_instance_id = decoded_response.id
      put "/gpdb_instances/#{gpdb_instance_id}", :instance => valid_attributes.merge(:name => "new_name")

      decoded_response.name.should == "new_name"
    end
  end
end
