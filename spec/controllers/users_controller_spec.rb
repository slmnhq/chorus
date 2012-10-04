require 'spec_helper'

describe UsersController do
  let(:user) { users(:owner) }

  before do
    log_in user
  end

  describe "#index" do
    it_behaves_like "an action that requires authentication", :get, :index

    it "succeeds" do
      get :index
      response.code.should == "200"
    end

    it "shows list of users" do
      get :index
      decoded_response.length.should == User.count
    end

    describe "sorting" do
      it "sorts by first name" do
        get :index
        decoded_response.first.first_name.should <= decoded_response.second.first_name
      end

      context "with a recognized sort order" do
        it "respects the sort order" do
          get :index, :order => "last_name"
          decoded_response.first.last_name.downcase.should <= decoded_response.second.last_name.downcase
        end
      end
    end

    describe "pagination" do
      it "paginates the collection" do
        get :index, :page => 1, :per_page => 2
        decoded_response.length.should == 2
      end

      it "defaults to page one" do
        get :index, :per_page => 2
        decoded_response.length.should == 2
      end

      it "accepts a page parameter" do
        get :index, :page => 2, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.username.should == User.order(:first_name)[2].username
      end

      it "defaults the per_page to fifty" do
        get :index
        request.params[:per_page].should == 50
      end
    end

    generate_fixture "userSet.json" do
      get :index
    end
  end

  describe "#create" do
    let(:params) {
      {:username => "another_user", :password => "secret", :first_name => "joe",
       :last_name => "user", :email => "joe@chorus.com", :title => "Data Scientist",
       :dept => "bureau of bureaucracy", :notes => "poor personal hygiene", :admin => true}
    }

    it_behaves_like "an action that requires authentication", :post, :create

    context "when creator is not admin" do
      let(:user) { users(:restricted_user) }

      it "should refuse" do
        post :create, params
        response.should be_forbidden
      end
    end

    context "when creator is admin" do
      let(:user) { users(:admin) }

      before do
        post :create, params
      end

      it "should succeed" do
        response.code.should == "201"
      end

      it "should create a user" do
        User.find_by_username(params[:username]).should be_present
      end

      it "should make a user an admin" do
        User.find_by_username(params[:username]).admin.should be_true
      end

      it "should return the user's fields except password" do
        params.each do |key, value|
          key = key.to_s
          decoded_response[key].should == value unless key == "password"
        end
      end

      it "should refuse invalid data" do
        post :create
        response.code.should == "422"
      end

      it "makes a UserAdded event" do
        event = Events::UserAdded.first
        event.new_user.should == User.find_by_username(params[:username])
        event.actor.should == user
      end

      generate_fixture "userWithErrors.json" do
        post :create
      end
    end
  end

  describe "#update" do
    let(:other_user) { users(:no_collaborators) }
    let(:admin) { users(:admin) }
    let(:non_admin) { users(:owner) }

    it_behaves_like "an action that requires authentication", :put, :update

    context "when logged in as an admin" do
      before do
        log_in admin
      end

      context "with a valid user id" do
        it "responds with the updated user" do
          put :update, :id => other_user.to_param, :admin => "true"
          response.code.should == "200"
          decoded_response.admin.should == true
        end

        it "allows making someone an admin" do
          put :update, :id => other_user.to_param, :admin => "true"
          other_user.reload.should be_admin
        end

        it "allows an admin to remove their own privileges, if there are other admins" do
          put :update, :id => admin.to_param, :admin => "false"
          response.code.should == "200"
          decoded_response.admin.should == false
        end

        it "does not allow an admin to remove their own privileges if there are no other admins" do
          users(:evil_admin).delete
          put :update, :id => admin.to_param, :admin => "false"
          response.code.should == "200"
          decoded_response.admin.should == true
        end

        it "updates other attributes" do
          put :update, :id => other_user.to_param, :first_name => "updated"
          decoded_response.first_name.should == "updated"
        end
      end

      context "with an invalid user id" do
        it "returns not found" do
          put :update, :id => 'bogus', :first_name => "updated"
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
          put :update, :id => non_admin.to_param, :first_name => "updated"
        }.to_not change { non_admin.reload.last_name }

        decoded_response.first_name.should == "updated"
      end

      it "does not allow non-admins to make themselves an admin" do
        put :update, :id => non_admin.to_param, :admin => "true"
        non_admin.reload.should_not be_admin
      end

      it "does not allow non-admins to update other users" do
        expect {
          put :update, :id => other_user.to_param, :first_name => "updated"
        }.to_not change { other_user.reload.first_name }
        response.code.should == "404"
      end

      it "lets users change their own password" do
        put :update, :id => non_admin.to_param, :password => '987654'
        response.code.should == "200"
        user = User.find(non_admin.to_param)
        user.password_digest.should == Digest::SHA256.hexdigest("987654" + user.password_salt)
      end
    end
  end

  describe "#show" do
    let(:user) { users(:owner) }
    let(:other_user) { users(:the_collaborator) }
    before do
      log_in user
    end

    it_behaves_like "an action that requires authentication", :get, :show

    context "with a valid user id" do
      it "succeeds" do
        get :show, :id => other_user.to_param
        response.should be_success
      end

      it "presents the user" do
        mock.proxy(controller).present(other_user)
        get :show, :id => other_user.to_param
      end
    end

    context "with an invalid user id" do
      it "returns not found" do
        get :show, :id => 'bogus'
        response.should be_not_found
      end
    end

    generate_fixture "user.json" do
      get :show, :id => other_user.to_param
    end
  end

  describe "#destroy" do
    context "admin" do
      before do
        log_in users(:admin)
      end

      context "user with no instances or workspaces" do
        let(:user) { users(:the_collaborator) }

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
        let(:user) { users(:the_collaborator) }

        before do
          user.gpdb_instances << gpdb_instances(:default)
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
        let(:user) { users(:the_collaborator) }

        before do
          user.owned_workspaces << workspaces(:public)
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
      let(:user) { users(:the_collaborator) }

      before(:each) do
        log_in users(:owner)
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
      let(:admin) { users(:admin) }

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
        log_in users(:admin)
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
        log_in users(:owner)
      end

      it "returns unauthorized" do
        get :ldap, :username => "foo"
        response.code.should == "403"
      end
    end
  end
end
