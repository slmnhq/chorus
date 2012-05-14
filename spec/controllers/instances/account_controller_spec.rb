require 'spec_helper'

describe Instances::AccountController do
  describe "#show" do
    let(:joe) { FactoryGirl.create(:user) }
    let(:instance) { FactoryGirl.create(:instance) }
    let!(:account) { FactoryGirl.create :instance_account, :instance => instance, :owner => joe }

    before do
      log_in joe
    end

    it "returns the current_user's InstanceAccount for the specified Instance" do
      get :show, :instance_id => instance.to_param
      response.code.should == "200"
      decoded_response.id.should == account.id
      decoded_response.db_username.should == account.db_username
    end

    it "generates a jasmine fixture", :fixture => true do
      get :show, :instance_id => instance.to_param
      save_fixture "instanceAccount.json"
    end
  end

  describe "#create" do
    let(:joe) { FactoryGirl.create :user }
    let(:instance) { FactoryGirl.create :instance }

    before do
      stub(Gpdb::ConnectionChecker).check!(anything, anything) { true }
      log_in joe
    end

    it "succeeds" do
      post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret"}
      response.code.should == "201"

      decoded_response.db_username.should == "lenny"
      decoded_response.owner.id.should == joe.id

      rehydrated_account = InstanceAccount.find(decoded_response.id)
      rehydrated_account.db_password.should == "secret"
    end

    context "when the credentials are invalid" do
      before do
        stub(Gpdb::ConnectionChecker).check!(anything, anything) { raise ApiValidationError }
      end

      it "fails" do
        post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret"}
        response.code.should == '422'
      end
    end

    context "for a shared accounts instance" do
      before do
        instance.update_attribute :shared, true
      end

      it "fails" do
        post :create, :instance_id => instance.id, :account => {:db_username => "lenny", :db_password => "secret"}
        response.should be_not_found
      end
    end
  end

  describe "#update" do
    let(:joe) { FactoryGirl.create :user }
    let(:instance) { FactoryGirl.create :instance }

    before do
      stub(Gpdb::ConnectionChecker).check!(anything, anything) { true }
      log_in joe
    end

    it "succeeds" do
      put :update, :instance_id => instance.id, :account => {:db_username => "changed", :db_password => "changed"}
      response.code.should == "200"

      decoded_response.db_username.should == "changed"
      decoded_response.owner.id.should == joe.id

      rehydrated_account = InstanceAccount.find(decoded_response.id)
      rehydrated_account.db_password.should == "changed"
    end

    context "for a shared instance" do
      before do
        instance.update_attribute :shared, true
      end

      it "fails" do
        put :update, :instance_id => instance.id, :account => {:db_username => "changed", :db_password => "changed"}
        response.should be_not_found
      end
    end

    context "when credentials are invalid " do
      before do
        stub(Gpdb::ConnectionChecker).check!(anything, anything) { raise ApiValidationError }
      end

      it "fails" do
        put :update, :instance_id => instance.id, :account => {:db_username => "changed", :db_password => "changed"}
        response.code.should == '422'
      end
    end
  end

  describe "#destroy" do
    let(:owner) { FactoryGirl.create :user }
    let!(:instance_account) { FactoryGirl.create(:instance_account, :instance => instance, :owner => owner) }
    let(:joe) { FactoryGirl.create(:user) }

    context "of an unshared account" do
      let(:instance) { FactoryGirl.create :instance, :owner => owner }

      before do
        log_in owner
      end

      it "succeeds" do
        delete :destroy, :instance_id => instance.id
        response.should be_success
      end

      it "deletes the current users account for this instance" do
        InstanceAccount.find_by_instance_id_and_owner_id(instance.id, owner.id).should_not be_nil
        delete :destroy, :instance_id => instance.id
        InstanceAccount.find_by_instance_id_and_owner_id(instance.id, owner.id).should be_nil
      end
    end

    context "of a shared account" do
      let(:instance) { FactoryGirl.create :instance, :owner => owner, :shared => true }

      it "does not delete the owner's account" do
        log_in owner
        lambda { delete :destroy, :instance_id => instance.id }.should_not change { InstanceAccount.count }
        response.code.should == "404"
      end

      it "does not delete the shared account" do
        log_in joe
        lambda { delete :destroy, :instance_id => instance.id }.should_not change { InstanceAccount.count }
        response.code.should == "404"
      end
    end
  end
end
