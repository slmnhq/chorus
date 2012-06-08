require 'spec_helper'

describe UsersController do
  describe "#index" do
    before do
      log_in FactoryGirl.create(:user, :username => 'some_user', :first_name => "marty", :last_name => "alpha")
      FactoryGirl.create(:user, :username => 'other_user', :first_name => "andy", :last_name => "bravo")
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

    it "generates a jasmine fixture", :fixture => true do
      get :index
      save_fixture "userSet.json"
    end

  end

  describe "#create" do
    before do
      @values = {:username => "another_user", :password => "secret", :first_name => "joe",
                 :last_name => "user", :email => "joe@chorus.com", :title => "Data Scientist",
                 :dept => "bureau of bureaucracy", :notes => "poor personal hygiene", :admin => true}
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

      it "should make a user an admin" do
        User.find_by_username(@values[:username]).admin.should be_true
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

      it "lets users change their own password" do
        put :update, :id => non_admin.to_param, :user => {:password => '987654'}
        response.code.should == "200"
        User.find(non_admin.to_param).password_digest.should == Digest::SHA1.hexdigest("987654")
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
        mock.proxy(controller).present(@other_user)
        get :show, :id => @other_user.to_param
      end
    end

    context "with an invalid user id" do
      it "returns not found" do
        get :show, :id => 'bogus'
        response.should be_not_found
      end
    end

    it "generates a jasmine fixture", :fixture => true do
      get :show, :id => @other_user.to_param
      save_fixture "user.json"
    end
  end

  describe "#destroy" do
    let(:user) { FactoryGirl.create :user }

    context "admin" do
      before do
        log_in FactoryGirl.create(:admin)
      end

      context "user with no instances or workspaces" do
        before do
          delete :destroy, :id => user.id
        end

        it "should succeed" do
          response.code.should == "200"
        end

        it "should respond with valid json" do
          lambda { JSON.parse(response.body) }.should_not raise_error
        end

        it "should delete the user" do
          deleted_user = User.find_with_destroyed(user.id)
          deleted_user.deleted_at.should_not be_nil
        end
      end

      context "user owns an instance" do
        before do
          user.instances << FactoryGirl.create(:instance, :owner => user)
          delete :destroy, :id => user.id
        end

        it "should fail" do
          response.code.should == "422"
        end

        it "should not delete the user" do
          live_user = User.find_with_destroyed(user.id)
          live_user.deleted_at.should be_nil
        end
      end

      context "user owns a workspace" do
        before do
          user.workspaces << FactoryGirl.create(:workspace, :owner => user)
          delete :destroy, :id => user.id
        end

        it "should fail" do
          response.code.should == "422"
        end

        it "should not delete the user" do
          live_user = User.find_with_destroyed(user.id)
          live_user.deleted_at.should be_nil
        end
      end
    end

    context "non-admin" do
      before(:each) do
        log_in FactoryGirl.create(:user)
        delete :destroy, :id => user.id
      end

      it "should not succeed" do
        response.code.should == "403"
      end

      it "should not delete the user" do
        live_user = User.find_with_destroyed(user.id)
        live_user.deleted_at.should be_nil
      end
    end

    context "admin trying to delete himself" do
      let(:admin) { FactoryGirl.create :admin }

      before do
        log_in admin
        delete :destroy, :id => admin.id
      end

      it "should not succeed" do
        response.code.should == "403"
      end
    end
  end

  describe "#ldap" do
    before do
      @user_attributes = {:username => "testguy", :first_name => "Test", :last_name => "Guy", :title => "Big Kahuna", :dept => "Greenery", :email => "testguy@example.com"}
      stub(LdapClient).search.with_any_args { [@user_attributes] }
    end

    it_behaves_like "an action that requires authentication", :get, :ldap

    context "as an admin" do
      before(:each) do
        log_in FactoryGirl.create(:admin)
      end

      it "returns the set of matching users" do
        get :ldap, :username => "foo"
        response.should be_success
        hash = response.decoded_body[:response].first
        @user_attributes.keys.each do |key|
          hash[key].should == @user_attributes[key]
        end
      end

    end

    context "as a non-admin" do
      before(:each) do
        log_in FactoryGirl.create(:user)
      end

      it "returns unauthorized" do
        get :ldap, :username => "foo"
        response.code.should == "403"
      end
    end
  end
end
