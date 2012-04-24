require 'spec_helper'

describe "creating a new gpdb instance" do
  let(:valid_attributes) do
    {
        :name => "good_gillette",
        :port => 5432,
        :host => "gillette.sf.pivotallabs.com",
        :database => "postgres",
        :username => "gpadmin",
        :password => "secret"
    }
  end

  let!(:user) { FactoryGirl.create :user, :username => 'some_user', :password => 'secret' }

  context "after the user has logged in" do
    before do
      post "/sessions", :username => "some_user", :password => "secret"
    end

    it "works" do
      post "/instances", :instance => valid_attributes

      response.code.should == "201"
    end
  end
end