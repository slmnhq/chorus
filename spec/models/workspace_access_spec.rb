require "spec_helper"

describe WorkspaceAccess do
  describe "#view?" do
    context "in a public workspace" do
      let(:workspace) { FactoryGirl.create(:workspace) }

      context "when the user is logged in" do
        let(:user) { FactoryGirl.create(:user) }
        let(:workspace_access) { WorkspaceAccess.new user }

        it "allows access" do
          workspace_access.can?(:view, workspace).should be_true
        end
      end

      context "when the user is not logged in" do
        let(:workspace_access) { WorkspaceAccess.new nil }

        it "forbids acess" do
          workspace_access.can?(:view, workspace).should be false
        end
      end
    end

    context "in a private workspace" do
      let(:workspace) { FactoryGirl.create(:workspace, :public => false) }

      it "forbids access when the user is not logged in" do
        workspace_access = WorkspaceAccess.new nil
        workspace_access.can?(:view, workspace).should be_false
      end

      context "when the user is logged in" do
        let(:user) { FactoryGirl.create(:user) }
        let(:workspace_access) { WorkspaceAccess.new user }

        it "forbids access when the user is not owner nor member" do
          workspace_access.can?(:view, workspace).should be_false
        end

        it "allows access when the user is a member of the workspace" do
          workspace.members << user
          workspace_access.can?(:view, workspace).should be_true
        end
      end
    end
  end

  describe "#edit?" do
    context "public workspace" do
      let(:workspace) { FactoryGirl.create(:workspace) }

      context "user is logged in but not a member" do
        let(:user) { FactoryGirl.create(:user) }
        let(:workspace_access) { WorkspaceAccess.new user }

        it "is not able to edit" do
          workspace_access.can?(:edit, workspace).should be_false
        end
      end

      context "user is not logged in" do
        let(:workspace_access) { WorkspaceAccess.new nil }

        it "should not be allowed to edit" do
          workspace_access.can?(:edit, workspace).should be false
        end
      end

      context "user is a member" do
        let(:user) { FactoryGirl.create(:user) }
        let(:workspace_access) { WorkspaceAccess.new user }

        it "lets him the workspace" do
          workspace.members << user
          workspace_access.can?(:edit, workspace).should be_true
        end
      end

      context "user is the owner" do
        let(:user) { FactoryGirl.create(:user) }
        let(:workspace) { FactoryGirl.create(:workspace, :owner => user) }
        let(:workspace_access) { WorkspaceAccess.new user }

        it "lets him edit the workspace" do
          workspace_access.can?(:edit, workspace).should be_true
        end
      end
    end

    context "in a private workspace" do
      let(:workspace) { FactoryGirl.create(:workspace) }

      context "user is not logged in" do
        let(:workspace_access) { WorkspaceAccess.new nil }

        it "should not be allowed to edit" do
          workspace_access.can?(:edit, workspace).should be false
        end
      end

      context "user is logged in" do
        let(:user) { FactoryGirl.create(:user) }
        let(:workspace_access) { WorkspaceAccess.new user }

        it "can't edit as a non-member" do
          workspace_access.can?(:edit, workspace).should be_false
        end

        it "can edit as a member" do
          workspace.members << user
          workspace_access.can?(:edit, workspace).should be_true
        end

        it "can edit as the owner" do
          workspace = FactoryGirl.create(:workspace, :owner => user)
          workspace_access = WorkspaceAccess.new user
          workspace_access.can?(:edit, workspace).should be_true
        end
      end
    end
  end
end
