require 'spec_helper'

describe Instances::SharingController do
  let(:instance) { FactoryGirl.create(:instance) }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => instance, :owner => instance.owner) }

  describe "#create" do
    before do
      log_in instance.owner
    end

    it "sets the shared attribute on an unshared instance" do
      instance.update_attributes(:shared => false)
      post :create, :instance_id => instance.to_param
      instance.reload.should be_shared
    end

    it "keeps the shared attribute on a shared instance" do
      instance.update_attributes(:shared => true)
      post :create, :instance_id => instance.to_param
      instance.reload.should be_shared
    end

    it "deletes accounts other than those belonging to the instance owner" do
      other_account = Factory.create(:instance_account, :instance => instance)

      post :create, :instance_id => instance.to_param

      owner_account.reload.should be_present
      InstanceAccount.where(:id => other_account.id).exists?.should be_false
    end

    it "rejects non-owners" do
      log_in FactoryGirl.create(:user)
      post :create, :instance_id => instance.to_param
      response.code.should == "404"
    end

    it "rejects non-owners of shared accounts" do
      log_in FactoryGirl.create(:user)
      instance.update_attributes(:shared => true)

      post :create, :instance_id => instance.to_param
      response.code.should == "404"
    end
  end

  describe "#destroy" do
    before do
      log_in instance.owner
    end

    it "removes the shared attribute from a shared instance" do
      instance.update_attributes(:shared => true)
      delete :destroy, :instance_id => instance.to_param
      instance.reload.should_not be_shared
    end

    it "keeps the unshared attribute on an unshared instance" do
      instance.update_attributes(:shared => false)
      delete :destroy, :instance_id => instance.to_param
      instance.reload.should_not be_shared
    end

    it "rejects non-owners" do
      log_in FactoryGirl.create(:user)
      delete :destroy, :instance_id => instance.to_param
      response.code.should == "404"
    end

    it "rejects non-owners of shared accounts" do
      log_in FactoryGirl.create(:user)
      instance.update_attributes(:shared => true)

      delete :destroy, :instance_id => instance.to_param
      response.code.should == "404"
    end
  end
end
