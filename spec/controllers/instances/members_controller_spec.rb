require 'spec_helper'

describe Instances::MembersController do
  let(:admin) { FactoryGirl.create :admin }
  let(:instance_owner) { FactoryGirl.create :user }
  let(:joe) { FactoryGirl.create :user }
  let(:tom) { FactoryGirl.create :user }
  let(:instance) { FactoryGirl.create :instance, :owner => instance_owner }

  describe "#index" do
    let!(:account1) { FactoryGirl.create :instance_account, :instance => instance, :db_username => "instance_owner", :owner => instance_owner }
    let!(:account2) { FactoryGirl.create :instance_account, :instance => instance, :db_username => "joe", :owner => joe }

    before do
      log_in instance_owner
    end

    it_behaves_like "an action that requires authentication", :get, :index

    it "succeeds" do
      get :index, :instance_id => instance.to_param
      response.code.should == "200"
    end

    it "shows list of users" do
      get :index, :instance_id => instance.to_param
      decoded_response.length.should == 2
    end

    describe "pagination" do
      let!(:bob) { FactoryGirl.create :user }
      let!(:account3) { FactoryGirl.create :instance_account, :instance => instance, :db_username => "bob", :owner => bob }

      it "paginates the collection" do
        get :index, :instance_id => instance.to_param, :page => 1, :per_page => 2
        decoded_response.length.should == 2
      end

      it "defaults to page one" do
        get :index, :instance_id => instance.to_param, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.db_username.should == "instance_owner"
        decoded_response.second.db_username.should == "joe"
      end

      it "accepts a page parameter" do
        get :index, :instance_id => instance.to_param, :page => 2, :per_page => 2
        decoded_response.length.should == 1
        decoded_response.first.db_username.should == "bob"
      end

      it "defaults the per_page to fifty" do
        get :index, :instance_id => instance.to_param
        request.params[:per_page].should == 50
      end
    end
  end

  describe "#create" do
    let!(:owner) { FactoryGirl.create :user }
    context "when admin" do
      before do
        log_in admin
      end

      context "for a shared account instance" do
        before do
          instance.update_attribute :shared, true
        end

        it "fails" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => owner.id}
          response.should be_not_found
        end
      end

      context "for an individual accounts instance" do
        it "get saved correctly" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => admin.id}
          response.code.should == "201"
          rehydrated_account = InstanceAccount.find(decoded_response.id)
          rehydrated_account.should be_present
          rehydrated_account.db_username.should == "lenny"
          rehydrated_account.db_password.should == "secret"
          rehydrated_account.owner.should == admin
          rehydrated_account.instance.should == instance
        end
      end
    end

    context "when instance owner" do
      before do
        log_in instance_owner
      end

      context "for a shared accounts instance" do
        before do
          instance.update_attribute :shared, true
        end

        it "fails" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => owner.id}
          response.should be_not_found
        end
      end

      context "for an individual accounts instance" do
        it "get saved correctly" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => owner.id}
          response.code.should == "201"
          rehydrated_account = InstanceAccount.find(decoded_response.id)
          rehydrated_account.should be_present
          rehydrated_account.db_username.should == "lenny"
          rehydrated_account.db_password.should == "secret"
          rehydrated_account.owner.should == owner
          rehydrated_account.instance.should == instance
        end
      end
    end

    context "when regular joe" do
      before do
        log_in joe
      end

      context "for a shared accounts instance" do
        before do
          instance.update_attribute :shared, true
        end

        it "fails" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => joe.id}
          response.should be_not_found
        end
      end

      context "for an individual accounts instance" do
        it "fails" do
          post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret", :owner_id => joe.id}
          response.should be_not_found
        end
      end
    end
  end

  describe "#update" do
    let(:account) { FactoryGirl.create :instance_account, :instance => instance, :owner => instance_owner }

    context "when admin" do
      before do
        log_in admin
      end

      it "succeeds" do
        put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed"}
        response.code.should == "200"

        decoded_response.db_username.should == "changed"
        decoded_response.owner.id.should == instance_owner.id

        rehydrated_account = InstanceAccount.find(decoded_response.id)
        rehydrated_account.db_password.should == "changed"
      end

      it "succeeds, even if instance is shared" do
        instance.update_attribute :shared, true
        put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed"}
        response.code.should == "200"
      end
    end

    context "when instance owner" do
      before do
        log_in instance_owner
      end

      it "succeeds for user's account" do
        put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed"}
        response.code.should == "200"

        decoded_response.db_username.should == "changed"
        decoded_response.owner.id.should == instance_owner.id

        rehydrated_account = InstanceAccount.find(decoded_response.id)
        rehydrated_account.db_password.should == "changed"
      end

      it "succeeds for user's account, even if instance is shared" do
        instance.update_attribute :shared, true
        put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed"}
        response.code.should == "200"
      end

      it "succeeds for other's account" do
        account.update_attribute :owner, joe
        put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed"}
        response.code.should == "200"

        decoded_response.db_username.should == "changed"
        decoded_response.owner.id.should == joe.id

        rehydrated_account = InstanceAccount.find(decoded_response.id)
        rehydrated_account.db_password.should == "changed"
      end
    end

    context "when regular joe" do
      before do
        log_in joe
      end

      context "someone else's account'" do
        it "fails" do
          put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed"}
          response.should be_not_found
        end
      end

      context "his own account" do
        before do
          account.owner = joe
          account.save!
        end

        it "fails" do
          put :update, :instance_id => instance.id, :id => account.id, :account => {:db_username => "changed", :db_password => "changed"}
          response.should be_not_found
        end
      end
    end
  end

  describe "#destroy" do
    before do
      @joe_account = FactoryGirl.create :instance_account, :instance => instance, :owner => joe
    end

    context "when the current user is the instance's owner" do
      before do
        log_in instance_owner
      end

      it "removes the given account" do
        instance.accounts.find_by_owner_id(joe.id).should_not be_nil
        delete :destroy, :instance_id => instance.id, :id => @joe_account.id
        instance.accounts.find_by_owner_id(joe.id).should be_nil
      end

      it "succeeds" do
        delete :destroy, :instance_id => instance.id, :id => @joe_account.id
        response.should be_ok
      end

      context "when there is no account for the given instance and user" do
        it "responds with 'not found'" do
          delete :destroy, :instance_id => instance.id, :id => 'not_an_id'
          response.should be_not_found
        end
      end
    end

    context "when the current user is not an admin nor the instance's owner" do
      before do
        log_in FactoryGirl.create(:user)
      end

      it "does not remove the account" do
        delete :destroy, :instance_id => instance.id, :id => @joe_account.id
        instance.accounts.find_by_owner_id(joe.id).should_not be_nil
      end

      it "responds with 'forbidden'" do
        delete :destroy, :instance_id => instance.id, :id => @joe_account.id
        response.should be_forbidden
      end
    end
  end
end
