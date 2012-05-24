require "spec_helper"

describe InstanceAccess do
  let(:user) { FactoryGirl.build(:user) }
  let(:owner) { FactoryGirl.build(:user) }
  let(:instance) { FactoryGirl.build(:instance, :owner => owner) }
  let(:instance_access) {
    controller = InstancesController.new
    stub(controller).current_user { user }
    InstanceAccess.new(controller)
  }

  describe "#edit?" do
    it "prevents regular users from editing" do
      instance_access.can?(:edit, instance).should be_false
    end

    it "allows owners to edit" do
      instance.owner = user
      instance_access.can?(:edit, instance).should be_true
    end

    it "allows admins to edit" do
      user.admin = true
      instance_access.can?(:edit, instance).should be_true
    end
  end
end

