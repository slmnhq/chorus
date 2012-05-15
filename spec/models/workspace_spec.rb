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
    let!(:owned_workspace) { FactoryGirl.create(:workspace, :public => false, :owner => user)}
    let!(:private_workspace) { FactoryGirl.create(:workspace, :public => false) }
    let(:user) { FactoryGirl.create(:user) }

    it "returns public workspaces" do
      Workspace.accessible_to(user).should include public_workspace
    end

    it "returns private workspaces with membership" do
      FactoryGirl.create(:membership, :user => user, :workspace => private_workspace)
      Workspace.accessible_to(user).should include private_workspace
    end

    it "returns private owned workspaces" do
      Workspace.accessible_to(user).should include owned_workspace
    end

    it "does not return private workspaces" do
      Workspace.accessible_to(user).should_not include private_workspace
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
