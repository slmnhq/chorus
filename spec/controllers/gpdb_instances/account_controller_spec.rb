require 'spec_helper'

describe GpdbInstances::AccountController do
  let(:gpdb_instance) { gpdb_instances(:owners) }
  let(:user) { users(:default) }
  let(:owner) { users(:owner) }
  let(:account) { gpdb_instance.account_for_user(owner) }

  describe "#show" do
    before do
      log_in owner
    end

    it "returns the current_user's InstanceAccount for the specified Instance" do
      get :show, :gpdb_instance_id => gpdb_instance.to_param
      response.code.should == "200"
      decoded_response.id.should == account.id
      decoded_response.db_username.should == account.db_username
    end

    generate_fixture "instanceAccount.json" do
      get :show, :gpdb_instance_id => gpdb_instance.to_param
    end
  end

  describe "#create" do
    before do
      stub(Gpdb::ConnectionChecker).check!(anything, anything) { true }
      log_in user
    end

    it "succeeds" do
      post :create, :gpdb_instance_id => gpdb_instance.id, :db_username => "lenny", :db_password => "secret"
      response.code.should == "201"

      decoded_response.db_username.should == "lenny"
      decoded_response.owner.id.should == user.id

      rehydrated_account = InstanceAccount.find(decoded_response.id)
      rehydrated_account.db_password.should == "secret"
    end

    context "when the credentials are invalid" do
      before do
        stub(Gpdb::ConnectionChecker).check!(anything, anything) { raise ApiValidationError }
      end

      it "fails" do
        post :create, :gpdb_instance_id => gpdb_instance.id, :db_username => "lenny", :db_password => "secret"
        response.code.should == '422'
      end
    end

    context "for a shared accounts instance" do
      before do
        gpdb_instance.update_attribute :shared, true
      end

      it "fails" do
        post :create, :gpdb_instance_id => gpdb_instance.id, :db_username => "lenny", :db_password => "secret"
        response.should be_not_found
      end
    end
  end

  describe "#update" do
    before do
      stub(Gpdb::ConnectionChecker).check!(anything, anything) { true }
      log_in user
    end

    it "succeeds" do
      put :update, :gpdb_instance_id => gpdb_instance.id, :db_username => "changed", :db_password => "changed"
      response.code.should == "200"

      decoded_response.db_username.should == "changed"
      decoded_response.owner.id.should == user.id

      rehydrated_account = InstanceAccount.find(decoded_response.id)
      rehydrated_account.db_password.should == "changed"
    end

    context "for a shared gpdb_instance" do
      before do
        gpdb_instance.update_attribute :shared, true
      end

      it "fails" do
        put :update, :gpdb_instance_id => gpdb_instance.id, :db_username => "changed", :db_password => "changed"
        response.should be_not_found
      end
    end

    context "when credentials are invalid " do
      before do
        stub(Gpdb::ConnectionChecker).check!(anything, anything) { raise ApiValidationError }
      end

      it "fails" do
        put :update, :gpdb_instance_id => gpdb_instance.id, :db_username => "changed", :db_password => "changed"
        response.code.should == '422'
      end
    end
  end

  describe "#destroy" do
    context "of an unshared account" do
      before do
        log_in owner
      end

      it "succeeds" do
        delete :destroy, :gpdb_instance_id => gpdb_instance.id
        response.should be_success
      end

      it "deletes the current users account for this gpdb_instance" do
        InstanceAccount.find_by_gpdb_instance_id_and_owner_id(gpdb_instance.id, owner.id).should_not be_nil
        delete :destroy, :gpdb_instance_id => gpdb_instance.id
        InstanceAccount.find_by_gpdb_instance_id_and_owner_id(gpdb_instance.id, owner.id).should be_nil
      end
    end

    context "of a shared account" do
      let(:gpdb_instance) { gpdb_instances(:shared) }
      let(:admin) { users(:admin) }

      it "does not delete the owner's account" do
        log_in admin
        lambda { delete :destroy, :gpdb_instance_id => gpdb_instance.id }.should_not change { InstanceAccount.count }
        response.code.should == "404"
      end

      it "does not delete the shared account" do
        log_in user
        lambda { delete :destroy, :gpdb_instance_id => gpdb_instance.id }.should_not change { InstanceAccount.count }
        response.code.should == "404"
      end
    end
  end
end
