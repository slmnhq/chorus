require "spec_helper"

describe InstanceAccess do
  let(:instance) { instances(:bobs_instance) }
  let(:owner) { instance.owner }
  let(:instance_access) {
    controller = InstancesController.new
    stub(controller).current_user { @user }
    InstanceAccess.new(controller)
  }

  describe ".instances_for" do
    it "returns limited instances" do
      @user = users(:admin)
      mock(Instance).accessible_to(@user)

      described_class.instances_for(@user)
    end

  end

  describe "#edit?" do
    it "prevents regular users from editing" do
      @user = users(:carly)
      instance_access.can?(:edit, instance).should be_false
    end

    it "allows owners to edit" do
      @user = instance.owner
      instance_access.can?(:edit, instance).should be_true
    end

    it "allows admins to edit" do
      @user = users(:admin)
      instance_access.can?(:edit, instance).should be_true
    end
  end

  describe "show_contents?" do
    context "for public instances" do
      it "shows for everybody, including non-owner, non-admin users" do
        @user = users(:alice)
        instance = instances(:purple_banana)
        instance.shared.should be_true
        instance_access.can?(:show_contents, instance).should be_true
      end
    end

    context "for private instances" do
      before do
        instance.shared.should be_false
      end

      it "allows members to show (which includes owner)" do
        @user = users(:carly)
        instance.account_for_user(@user).should_not be_nil
        instance_access.can?(:show_contents, instance).should be_true
      end

      it "prevents non-members from showing" do
        @user = users(:alice)
        instance.account_for_user(@user).should be_nil
        instance_access.can?(:show_contents, instance).should be_false
      end

      it "prevents non-member admins from showing" do
        @user = users(:admin)
        instance.account_for_user(@user).should be_nil
        instance_access.can?(:show_contents, instance).should be_false
      end
    end
  end
end