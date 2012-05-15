require "spec_helper"
describe Workspace do
  describe "validations" do
    it { should validate_presence_of :name }
  end

  describe ".active" do
    let!(:active_workspace) { FactoryGirl.create :workspace }
    let!(:archived_workspace) { FactoryGirl.create :workspace, :archived_at => 2.days.ago }

    it "returns only active workspaces" do
      workspaces = Workspace.active
      workspaces.length.should == 1
      workspaces.should_not include(archived_workspace)
    end
  end

  describe ".accessible_to" do
    let!(:public_workspace) { FactoryGirl.create(:workspace, :public => true) }
    let!(:private_workspace) { FactoryGirl.create(:workspace, :public => false) }

    context "member" do
      let(:member) { FactoryGirl.create(:membership, :workspace => private_workspace).user }

      it "sees public workspaces" do
        Workspace.accessible_to(member).should include public_workspace
      end

      it "sees private workspaces with membership" do
        Workspace.accessible_to(member).should include private_workspace
      end

      it "does not see private workspaces without membership" do
        workspace_without_membership = FactoryGirl.create(:workspace, :public => false)
        Workspace.accessible_to(member).should_not include workspace_without_membership
      end
    end

    context "owner" do
      let(:owner) { private_workspace.owner }

      it "sees public workspaces" do
        Workspace.accessible_to(owner).should include public_workspace
      end

      it "sees private workspaces with ownership" do
        Workspace.accessible_to(owner).should include private_workspace
      end

      it "does not see private workspaces owned by someone else" do
        workspace_without_ownership = FactoryGirl.create(:workspace, :public => false)
        Workspace.accessible_to(owner).should_not include workspace_without_ownership
      end
    end
  end

  describe "#image" do
    it "should have a nil image instead of a default missing image" do
      workspace = FactoryGirl.create(:workspace, :image => nil)
      workspace.image.url.should == ""
    end
  end

  it { should have_attached_file(:image) }

  describe "associations" do
    it { should have_many(:members) }
  end
end
