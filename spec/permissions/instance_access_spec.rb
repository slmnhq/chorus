require "spec_helper"

describe InstanceAccess do
  let(:user) { FactoryGirl.create(:user) }
  let(:owner) { FactoryGirl.create(:user) }
  let(:instance) { FactoryGirl.create(:instance, :owner => owner) }
  let(:instance_access) {
    controller = InstancesController.new
    stub(controller).current_user { user }
    InstanceAccess.new(controller)
  }

  describe ".instances_for" do
    let(:admin) do
      stub(user = Object.new).admin? { true }
      user
    end

    let(:non_admin) do
      stub(user = Object.new).admin? { false }
      user
    end

    context "user is admin" do
      it "returns unscoped instances" do
        mock(Instance).scoped

        described_class.instances_for(admin)
      end
    end

   context "user is not admin" do
      it "returns limited instances" do
        mock(Instance).accessible_to(non_admin)

        described_class.instances_for(non_admin)
      end
    end

  end

  describe "#edit?" do
    it "prevents regular users from editing" do
      instance_access.can?(:edit, instance).should be_false
    end

    it "allows owners to edit" do
      instance.owner = user
      instance_access.can?(:edit, instance).should be_true
    end
  end

  describe "show?" do
    context "for public instances" do
      it "shows for everybody, including non-owner, non-admin users" do
        instance.update_attribute :shared, true
        instance_access.can?(:show, instance).should be_true
      end
    end

    context "for private instances" do
      before do
        instance.shared = false
      end

      it "allows members to show (which includes owner)" do
        instance_account = FactoryGirl.create(:instance_account, :owner => user, :instance => instance)
        instance_access.can?(:show, instance).should be_true
      end

      it "prevents non-members from showing" do
        instance_access.can?(:show, instance).should be_false
      end
    end
  end
end

