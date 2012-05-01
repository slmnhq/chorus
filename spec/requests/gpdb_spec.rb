require 'spec_helper'

describe "gpdb instances", :network => true do
  let(:valid_attributes) do
    {
        :name => "good_gillette",
        :port => 5432,
        :host => "gillette.sf.pivotallabs.com",
        :database => "postgres",
        :db_username => "gpadmin",
        :db_password => "secret"
    }
  end

  let!(:user) { FactoryGirl.create :user, :username => 'some_user', :password => 'secret' }

  context "after the user has logged in" do
    before do
      post "/sessions", :username => "some_user", :password => "secret"
    end

    it "can be created" do
      post "/instances", :instance => valid_attributes

      response.code.should == "201"
    end

    it "can be updated" do
      post "/instances", :instance => valid_attributes
      instance_id = decoded_response.id
      put "/instances/#{instance_id}", :instance => valid_attributes.merge(:name => "new name")

      decoded_response.name.should == "new name"
    end
  end
end