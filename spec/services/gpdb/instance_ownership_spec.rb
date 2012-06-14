require "spec_helper"

describe Gpdb::InstanceOwnership do
  let!(:old_owner) { instance.owner }
  let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => instance, :owner => old_owner) }
  let!(:new_owner) { FactoryGirl.create(:user) }

  describe ".change_owner(instance, new_owner)" do
    context "with a shared instance" do
      let(:instance) { FactoryGirl.create(:instance, :shared => true) }

      it "switches ownership of instance and account" do
        request_ownership_update
        instance.owner.should == new_owner
        owner_account.owner.should == new_owner
      end
    end

    context "with an unshared instance" do
      let(:instance) { FactoryGirl.create(:instance, :shared => false) }

      context "when switching to a user with an existing account" do
        before do
          FactoryGirl.create(:instance_account, :instance => instance, :owner => new_owner)
        end

        it "switches ownership of instance" do
          request_ownership_update
          instance.owner.should == new_owner
        end

        it "keeps ownership of account" do
          request_ownership_update
          owner_account.owner.should == old_owner
        end
      end

      context "when switching to a user without an existing account" do
        it "complains" do
          expect {
            request_ownership_update
          }.to raise_error(ActiveRecord::RecordNotFound)
        end
      end
    end
  end

  def request_ownership_update
    Gpdb::InstanceOwnership.change(instance, new_owner)
    instance.reload
    owner_account.reload
  end
end
