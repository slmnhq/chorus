require 'spec_helper'

describe UsersController do
  describe "#index" do
    context "before logging in" do
      it "says user is unauthorized" do
        get :index
        response.code.should == "401"
      end
    end

    context "after logging in" do
      let(:user) { User.create! :username => 'some_user', :first_name => "Sam", :last_name => "blow", :password => 'secret', :password_confirmation => 'secret' }

      before do
        log_in user
        User.create! :username => 'other_user', :first_name => "joe", :last_name => "Jenkins", :password => 'secret', :password_confirmation => 'secret'
      end

      it "succeeds" do
        get :index
        response.code.should == "200"
      end

      it "shows list of users" do
        get :index
        response_object = JSON.parse(response.body)["response"]
        response_object.should be_present
        response_object.length.should == 2
      end

      it "sorts by first name" do
        get :index
        response_object = JSON.parse(response.body)["response"]
        response_object.first["username"].should == "other_user"
        response_object.second["username"].should == "some_user"
      end

      context "with a recognized sort order" do
        it "respects the sort order" do
          get :index, :order => "last_name"
          response_object = JSON.parse(response.body)["response"]
          response_object.first["username"].should == "some_user"
          response_object.second["username"].should == "other_user"
        end
      end

      context "with an unrecognized sort order" do
        it "fails" do
          get :index, :order => "last_name; DROP TABLE users;"
          response.code.should == "400"
        end
      end
    end
  end
end