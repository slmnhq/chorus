require 'spec_helper'

describe GpdbInstances::SharingController do
  let(:gpdb_instance) { gpdb_instances(:owners) }
  let(:owner_account) { gpdb_instance.owner_account }
  let(:owner) { users(:owner) }
  let(:user) { users(:default) }

  describe "#create" do
    before do
      log_in owner
    end

    it "sets the shared attribute on an unshared gpdb instance" do
      gpdb_instance.update_attributes(:shared => false)
      post :create, :gpdb_instance_id => gpdb_instance.to_param
      decoded_response.shared.should be_true
    end

    it "keeps the shared attribute on a shared gpdb instance" do
      gpdb_instance.update_attributes(:shared => true)
      post :create, :gpdb_instance_id => gpdb_instance.to_param
      decoded_response.shared.should be_true
    end

    it "deletes accounts other than those belonging to the gpdb instance owner" do
      other_account = gpdb_instance.account_for_user(users(:the_collaborator))

      post :create, :gpdb_instance_id => gpdb_instance.to_param

      owner_account.reload.should be_present
      InstanceAccount.where(:id => other_account.id).exists?.should be_false
    end

    it "rejects non-owners" do
      log_in user
      post :create, :gpdb_instance_id => gpdb_instance.to_param
      response.code.should == "404"
    end

    it "rejects non-owners of shared accounts" do
      log_in user
      gpdb_instance.update_attributes(:shared => true)

      post :create, :gpdb_instance_id => gpdb_instance.to_param
      response.code.should == "404"
    end
  end

  describe "#destroy" do
    before do
      log_in owner
    end

    it "removes the shared attribute from a shared gpdb instance" do
      gpdb_instance.update_attributes(:shared => true)
      delete :destroy, :gpdb_instance_id => gpdb_instance.to_param
      decoded_response.shared.should_not be_true
    end

    it "keeps the unshared attribute on an unshared gpdb instance" do
      gpdb_instance.update_attributes(:shared => false)
      delete :destroy, :gpdb_instance_id => gpdb_instance.to_param
      decoded_response.shared.should_not be_true
    end

    it "rejects non-owners" do
      log_in user
      delete :destroy, :gpdb_instance_id => gpdb_instance.to_param
      response.code.should == "404"
    end

    it "rejects non-owners of shared accounts" do
      log_in user
      gpdb_instance.update_attributes(:shared => true)

      delete :destroy, :gpdb_instance_id => gpdb_instance.to_param
      response.code.should == "404"
    end
  end
end
