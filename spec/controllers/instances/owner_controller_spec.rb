require 'spec_helper'

describe Instances::OwnerController do
  let(:old_owner) { instance.owner }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => instance, :owner => old_owner) }

  describe "#update" do
    before do
      log_in old_owner
    end

    def request_ownership_update
      put :update, :instance_id => instance.to_param, :owner => {:id => new_owner.to_param}
    end

    context "of a shared instance" do
      let(:instance) { FactoryGirl.create(:instance, :shared => true) }
      let(:new_owner) { FactoryGirl.create(:user) }

      it "switches ownership of instance and account" do
        request_ownership_update
        response.code.should == "200"

        decoded_response.owner.id.should == new_owner.id
        owner_account.reload.owner.should == new_owner
      end

      it "ignores requests from non-owners" do
        log_in FactoryGirl.create(:user)
        request_ownership_update
        response.code.should == "404"
      end
    end

    context "of an unshared instance" do
      let(:instance) { FactoryGirl.create(:instance, :shared => false) }

      context "when switching to a user with an existing account" do
        let(:new_owner) { FactoryGirl.create(:instance_account, :instance => instance).owner }

        it "switches ownership of instance" do
          request_ownership_update
          response.code.should == "200"
          decoded_response.owner.id.should == new_owner.id
        end

        it "keeps ownership of account" do
          request_ownership_update
          owner_account.reload.owner.should == old_owner
        end
      end

      context "when switching to a user without an existing account" do
        let(:new_owner) { FactoryGirl.create(:user) }

        it "complains" do
          request_ownership_update
          response.code.should == "404"
        end
      end
    end
  end
end
