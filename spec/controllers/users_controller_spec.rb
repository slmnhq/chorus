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
      before do
        log_in FactoryGirl.create(:user, :username => 'some_user', :first_name => "zed")
        FactoryGirl.create(:user, :username => 'other_user', :first_name => "andy")
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
          FactoryGirl.create(:user, :username => 'third_user', :first_name => "zed", :last_name => "bob", :password => 'secret', :email => "jj@emc.com")
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
          get :index
          request.params[:per_page].should == 50
        end
      end
    end
  end

  describe "#create" do
    before do
      @values = { :username => "another_user", :password => "secret", :first_name => "joe",
        :last_name => "user", :email => "joe@chorus.com", :title => "Data Scientist",
        :dept => "bureau of bureaucracy", :notes => "poor personal hygiene"}
    end

    context "not logged in" do
      it "should refuse" do
        post :create, @values
        response.code.should == "401"
      end
    end

    context "not admin" do
      before do
        log_in FactoryGirl.build :user
      end

      it "should refuse" do
        post :create, @values
        response.code.should == "401"
      end
    end

    context "admin" do
      before do
        log_in FactoryGirl.create(:admin, :username => 'some_user')
        post :create, @values
      end

      it "should succeed" do
        response.code.should == "201"
      end

      it "should create a user" do
        User.find_by_username(@values[:username]).should be_present
      end

      it "should return the user's fields except password" do
        response_object = JSON.parse(response.body)["response"]

        @values.each{|key, value|
          key = key.to_s
          response_object[key].should == value unless key == "password"
        }
      end

      describe "validation" do
        required_fields = [:first_name, :last_name, :username, :email, :password]
        required_fields.each do |field|
          it "should require field: #{field}" do
            values_minus_field = @values.clone
            values_minus_field.delete(field)

            post :create, values_minus_field

            response.code.should == "422"
          end
        end
      end
    end
  end

  describe "#update" do
    let(:other_user) { FactoryGirl.create :user }
    let(:admin) { FactoryGirl.create :admin }
    let(:non_admin) { FactoryGirl.create :user }

    context "when logged in as an admin" do
      before do
        log_in admin
      end

      it "responds with the updated user" do
        put :update, :id => other_user.to_param, :user => {:admin => "true"}
        response.code.should == "200"
        decoded_response.admin.should == true
      end

      it "allows making someone an admin" do
        put :update, :id => other_user.to_param, :user => {:admin => "true"}
        other_user.reload.should be_admin
      end

      it "allows an admin to revoke another user's admin privileges" do
        other_user.admin = true
        other_user.save!
        put :update, :id => other_user.to_param, :user => {:admin => "false"}
        response.code.should == "200"
        decoded_response.admin.should == false
      end

      it "does not allow the last admin to be removed"
    end

    context "when the current user is not an admin" do
      before do
        log_in non_admin
      end

      it "does not allow non-admins to make someone an admin" do
        put :update, :id => other_user.to_param, :user => {:admin => "true"}
        other_user.reload.should_not be_admin
      end
    end
  end
end
