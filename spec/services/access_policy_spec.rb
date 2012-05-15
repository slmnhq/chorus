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
end
