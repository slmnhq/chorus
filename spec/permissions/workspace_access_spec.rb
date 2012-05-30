require "spec_helper"

describe WorkspaceAccess do
  let(:user) { FactoryGirl.create(:user) }
  let(:workspace) { FactoryGirl.create(:workspace) }
  let(:private_workspace) { FactoryGirl.create(:workspace, :public => false) }
  let(:owned_workspace) { FactoryGirl.create(:workspace, :owner => user) }
  let(:workspace_access) {
    controller = WorkspacesController.new
    stub(controller).current_user { user }
    WorkspaceAccess.new(controller)
  }

  let(:admin) do
    stub(user = Object.new).admin? { true }
    user
  end

  let(:non_admin) do
    stub(user = Object.new).admin? { false }
    user
  end

  describe ".workspaces_for" do
    context "user is admin" do
      it "returns unscoped workspaces" do
        mock(Workspace).scoped

        described_class.workspaces_for(admin)
      end
    end

    context "user is not admin" do
      it "returns limited workspaces" do
        mock(Workspace).accessible_to(non_admin)

        described_class.workspaces_for(non_admin)
      end
    end
  end

  describe ".members_for" do
    let(:workspace) { Object.new }

    context "user is admin" do
      it "returns all members" do
        mock(workspace).members

        described_class.members_for(admin, workspace)
      end
    end

    context "user is not admin" do
      it "calls workspace.members_accessible_to" do
        mock(workspace).members_accessible_to(non_admin)

        described_class.members_for(non_admin, workspace)
      end
    end
  end

  describe "#show?" do
    context "in a public workspace" do

      it "always allows access" do
        workspace_access.can?(:show, workspace).should be_true
      end
    end

    context "in a private workspace" do

      it "forbids access when the user is not a member nor admin" do
        workspace_access.can?(:show, private_workspace).should be_false
      end

      it "allows access when the user is a member of the workspace" do
        private_workspace.members << user
        workspace_access.can?(:show, private_workspace).should be_true
      end

      it "allows access when the user is an admin" do
        user.admin = true
        workspace_access.can?(:show, private_workspace).should be_true
      end
    end
  end

  describe "#workspace_create?" do
    it "doesn't allow non-members to edit'" do
      workspace_access.can?(:workfile_create, private_workspace).should be_false
    end

    it "allows members to edit" do
      private_workspace.members << user
      workspace_access.can?(:workfile_create, private_workspace).should be_true
    end

    it "allows admin to edit" do
      user.admin = true
      workspace_access.can?(:workfile_create, private_workspace).should be_true
    end
  end

  describe "#member_edit?" do
    context "in a public workspace" do
      it "doesn't allow non-members to edit" do
        workspace_access.can?(:member_edit, workspace).should be_false
      end

      it "allows members to edit" do
        workspace.members << user
        workspace_access.can?(:member_edit, workspace).should be_true
      end

      it "allows admin to edit" do
        user.admin = true
        workspace_access.can?(:member_edit, workspace).should be_true
      end
    end

    context "in a private workspace" do
      it "doesn't allow non-members to edit'" do
        workspace_access.can?(:member_edit, private_workspace).should be_false
      end

      it "allows members to edit" do
        private_workspace.members << user
        workspace_access.can?(:member_edit, private_workspace).should be_true
      end

      it "allows admin to edit" do
        user.admin = true
        workspace_access.can?(:member_edit, private_workspace).should be_true
      end
    end
  end

  describe "#administrative_edit?" do
    context "in a public workspace" do
      it "doesn't allow non-members to edit" do
        workspace_access.can?(:administrative_edit, workspace).should be_false
      end

      it "allows members to edit" do
        workspace.members << user
        workspace_access.can?(:administrative_edit, workspace).should be_false
      end

      it "allows the owner to edit" do
        workspace.owner = user
        workspace_access.can?(:administrative_edit, workspace).should be_true
      end

      it "allows admin to edit" do
        user.admin = true
        workspace_access.can?(:administrative_edit, workspace).should be_true
      end
    end

    context "in a private workspace" do
      it "doesn't allow non-members to edit'" do
        workspace_access.can?(:administrative_edit, private_workspace).should be_false
      end

      it "allows members to edit" do
        private_workspace.members << user
        workspace_access.can?(:administrative_edit, private_workspace).should be_false
      end

      it "allows the owner to edit" do
        private_workspace.owner = user
        workspace_access.can?(:administrative_edit, private_workspace).should be_true
      end

      it "allows admin to edit" do
        user.admin = true
        workspace_access.can?(:administrative_edit, private_workspace).should be_true
      end
    end
  end
end
