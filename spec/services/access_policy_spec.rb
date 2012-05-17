require 'spec_helper'

describe AccessPolicy do
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

  describe ".instances_for" do
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

  describe ".workspace_member_for" do
    let(:workspace) { Object.new }

    context "user is admin" do
      it "returns all members" do
        mock(workspace).members

        described_class.workspace_members_for(admin, workspace)
      end
    end

    context "user is not admin" do
      it "calls workspace.members_accessible_to" do
        mock(workspace).members_accessible_to(non_admin)

        described_class.workspace_members_for(non_admin, workspace)
      end
    end
  end

  describe ".databases_for" do
    context "user is admin" do
      it "returns all databases" do
        mock(GpdbDatabase).scoped
        described_class.databases_for(admin)
      end
    end

    context "user has access to instances" do
      it "returns instances' databases" do
        stub(Instance).accessible_to(non_admin) do |instance_scope|
          stub(instance_scope).pluck(:id) { [1, 2]}
        end

        mock(GpdbDatabase).where(:instance_id => [1, 2])
        described_class.databases_for(non_admin)
      end
    end
  end
end
