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

      describe "sorting" do
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

      describe "pagination" do
        before do
          User.create! :username => 'third_user', :first_name => "zed", :last_name => "bob", :password => 'secret', :password_confirmation => 'secret'
        end

        it "paginates the collection" do
          get :index, :page => 1, :per_page => 2
          response_object = JSON.parse(response.body)["response"]
          response_object.length.should == 2
        end

        it "defaults to page one" do
          get :index, :per_page => 2
          response_object = JSON.parse(response.body)["response"]
          response_object.length.should == 2
          response_object.first["username"].should == "other_user"
          response_object.second["username"].should == "some_user"
        end

        it "accepts a page parameter" do
          get :index, :page => 2, :per_page => 2
          response_object = JSON.parse(response.body)["response"]
          response_object.length.should == 1
          response_object.first["username"].should == "third_user"
        end

        it "defaults the per_page to fifty" do
          (1..48).each { |n| User.create! :username => "user#{n}", :first_name => "User #{n}", :last_name => "Last #{n}", :password => 'secret', :password_confirmation => 'secret' }
          get :index
          response_object = JSON.parse(response.body)["response"]
          response_object.length.should == 50
        end
      end
    end
  end
end