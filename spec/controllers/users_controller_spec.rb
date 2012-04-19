require 'spec_helper'

describe UsersController do
  describe "#index" do
    before do
      log_in FactoryGirl.create(:user, :username => 'some_user', :first_name => "marty")
      FactoryGirl.create(:user, :username => 'other_user', :first_name => "andy")
    end

    it_behaves_like "an action that requires authentication", :get, :index

    it "succeeds" do
      get :index
      response.code.should == "200"
    end

    it "shows list of users" do
      get :index
      decoded_response.length.should == 2
    end

    describe "sorting" do
      it "sorts by first name" do
        get :index
        decoded_response.first.username.should == "other_user"
        decoded_response.second.username.should == "some_user"
      end

      context "with a recognized sort order" do
        it "respects the sort order" do
          get :index, :order => "last_name"
          decoded_response.first.username.should == "some_user"
          decoded_response.second.username.should == "other_user"
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
        decoded_response.length.should == 2
      end

      it "defaults to page one" do
        get :index, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.username.should == "other_user"
        decoded_response.second.username.should == "some_user"
      end

      it "accepts a page parameter" do
        get :index, :page => 2, :per_page => 2
        decoded_response.length.should == 1
        decoded_response.first.username.should == "third_user"
      end

      it "defaults the per_page to fifty" do
        get :index
        request.params[:per_page].should == 50
      end
    end
  end

  describe "#create" do
    before do
      @values = {:username => "another_user", :password => "secret", :first_name => "joe",
                 :last_name => "user", :email => "joe@chorus.com", :title => "Data Scientist",
                 :dept => "bureau of bureaucracy", :notes => "poor personal hygiene"}
    end

    it_behaves_like "an action that requires authentication", :post, :create

    context "not admin" do
      before do
        log_in FactoryGirl.build :user
      end

      it "should refuse" do
        post :create, {:user => @values}
        response.code.should == "401"
      end
    end

    context "admin" do
      before do
        log_in FactoryGirl.create(:admin, :username => 'some_user')
        post :create, {:user => @values}
      end

      it "should succeed" do
        response.code.should == "201"
      end

      it "should create a user" do
        User.find_by_username(@values[:username]).should be_present
      end

      it "should return the user's fields except password" do
        @values.each do |key, value|
          key = key.to_s
          decoded_response[key].should == value unless key == "password"
        end
      end

      it "should refuse invalid data" do
        post :create, {:user => {}}
        response.code.should == "422"
      end
    end
  end

  describe "#update" do
    let(:other_user) { FactoryGirl.create :user }
    let(:admin) { FactoryGirl.create :admin }
    let(:non_admin) { FactoryGirl.create :user }

    it_behaves_like "an action that requires authentication", :put, :update

    context "when logged in as an admin" do
      before do
        log_in admin
      end

      context "with a valid user id" do
        it "responds with the updated user" do
          put :update, :id => other_user.to_param, :user => {:admin => "true"}
          response.code.should == "200"
          decoded_response.admin.should == true
        end

        it "allows making someone an admin" do
          put :update, :id => other_user.to_param, :user => {:admin => "true"}
          other_user.reload.should be_admin
        end

        it "allows an admin to remove their own privileges, if there are other admins" do
          other_admin = FactoryGirl.create(:admin)
          put :update, :id => admin.to_param, :user => {:admin => "false"}
          response.code.should == "200"
          decoded_response.admin.should == false
        end

        it "does not allow an admin to remove their own priveleges if there are no other admins" do
          put :update, :id => admin.to_param, :user => {:admin => "false"}
          response.code.should == "200"
          decoded_response.admin.should == true
        end

        it "updates other attributes" do
          put :update, :id => other_user.to_param, :user => {:first_name => "updated"}
          decoded_response.first_name.should == "updated"
        end
      end

      context "with an invalid user id" do
        it "returns not found" do
          put :update, :id => 'bogus', :user => {:first_name => "updated"}
          response.should be_not_found
        end
      end
    end

    context "when the current user is not an admin" do
      before do
        log_in non_admin
      end

      it "allows the user to edit their own profile" do
        expect {
          put :update, :id => non_admin.to_param, :user => {:first_name => "updated"}
        }.to_not change { non_admin.reload.last_name }

        decoded_response.first_name.should == "updated"
      end

      it "does not allow non-admins to make themselves an admin" do
        put :update, :id => non_admin.to_param, :user => {:admin => "true"}
        non_admin.reload.should_not be_admin
      end

      it "does not allow non-admins to update other users" do
        expect {
          put :update, :id => other_user.to_param, :user => {:first_name => "updated"}
        }.to_not change { other_user.reload.first_name }
        response.code.should == "404"
      end
    end
  end

  describe "#show" do
    before do
      @user = FactoryGirl.create(:user)
      @other_user = FactoryGirl.create(:user)
      log_in @user
    end

    it_behaves_like "an action that requires authentication", :get, :show

    context "with a valid user id" do
      it "succeeds" do
        get :show, :id => @other_user.to_param
        response.should be_success
      end

      it "presents the user" do
        get :show, :id => @other_user.to_param
        response.should have_presented(@other_user)
      end
    end

    context "with an invalid user id" do
      it "returns not found" do
        get :show, :id => 'bogus'
        response.should be_not_found
      end
    end
  end
end
