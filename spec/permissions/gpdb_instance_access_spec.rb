require "spec_helper"

describe GpdbInstanceAccess do
  let(:gpdb_instance) { gpdb_instances(:owners) }
  let(:owner) { gpdb_instance.owner }
  let(:instance_access) {
    controller = GpdbInstancesController.new
    stub(controller).current_user { @user }
    GpdbInstanceAccess.new(controller)
  }

  describe ".gpdb_instances_for" do
    it "returns limited instances" do
      @user = users(:admin)
      mock(GpdbInstance).accessible_to(@user)

      described_class.gpdb_instances_for(@user)
    end

  end

  describe "#edit?" do
    it "prevents regular users from editing" do
      @user = users(:the_collaborator)
      instance_access.can?(:edit, gpdb_instance).should be_false
    end

    it "allows owners to edit" do
      @user = gpdb_instance.owner
      instance_access.can?(:edit, gpdb_instance).should be_true
    end

    it "allows admins to edit" do
      @user = users(:admin)
      instance_access.can?(:edit, gpdb_instance).should be_true
    end
  end

  describe "show_contents?" do
    context "for public gpdb instances" do
      it "shows for everybody, including non-owner, non-admin users" do
        @user = users(:no_collaborators)
        gpdb_instance = gpdb_instances(:shared)
        gpdb_instance.shared.should be_true
        instance_access.can?(:show_contents, gpdb_instance).should be_true
      end
    end

    context "for private gpdb instances" do
      before do
        gpdb_instance.shared.should be_false
      end

      it "allows members to show (which includes owner)" do
        @user = users(:the_collaborator)
        gpdb_instance.account_for_user(@user).should_not be_nil
        instance_access.can?(:show_contents, gpdb_instance).should be_true
      end

      it "prevents non-members from showing" do
        @user = users(:no_collaborators)
        gpdb_instance.account_for_user(@user).should be_nil
        instance_access.can?(:show_contents, gpdb_instance).should be_false
      end

      it "prevents non-member admins from showing" do
        @user = users(:admin)
        gpdb_instance.account_for_user(@user).should be_nil
        instance_access.can?(:show_contents, gpdb_instance).should be_false
      end
    end
  end
end