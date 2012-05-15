require 'spec_helper'

describe AccessPolicy do
  describe ".workspaces_for" do
    context "user is admin" do
      let(:user) do
        stub(user = Object.new).admin? { true }
        user
      end

      it "returns unscoped workspaces" do
        mock(Workspace).scoped

        described_class.workspaces_for(user)
      end
    end

    context "user is not admin" do
      let(:user) do
        stub(user = Object.new).admin? { false }
        user
      end

      it "returns limited workspaces" do
        mock(Workspace).accessible_to(user)

        described_class.workspaces_for(user)
      end
    end
  end

  describe ".instances_for" do
    context "user is admin" do
      let(:user) do
        stub(user = Object.new).admin? { true }
        user
      end

      it "returns unscoped instances" do
        mock(Instance).scoped

        described_class.instances_for(user)
      end
    end

    context "user is not admin" do
      let(:user) do
        stub(user = Object.new).admin? { false }
        user
      end

      it "returns limited instances" do
        mock(Instance).accessible_to(user)

        described_class.instances_for(user)
      end
    end
  end

  describe ".workspace_member_for" do
    let(:workspace) { Object.new }
    context "user is admin" do
      let(:user) do
        stub(user = Object.new).admin? { true }
        user
      end

      it "returns all members" do
        mock(workspace).members

        described_class.workspace_members_for(user, workspace)
      end
    end

    context "user is not admin" do
      let(:user) do
        stub(user = Object.new).admin? { false }
        user
      end

      it "calls workspace.members_accessible_to" do
        mock(workspace).members_accessible_to(user)

        described_class.workspace_members_for(user, workspace)
      end
    end
  end

end
