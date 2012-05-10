require "spec_helper"
describe Workspace do
  let!(:active_workspace) { FactoryGirl.create :workspace }

  describe "validations" do
    it { should validate_presence_of :name }
  end

  describe ".active" do
    let!(:archived_workspace) { FactoryGirl.create :workspace, :archived_at => 2.days.ago }

    it "returns only active workspaces" do
      workspaces = Workspace.active
      workspaces.length.should == 1
      workspaces.should_not include(archived_workspace)
    end
  end

  describe "#image" do
    it "should have a nil image instead of a default missing image" do
      workspace = FactoryGirl.create(:workspace, :image => nil)
      workspace.image.url.should == ""
    end
  end

  it { should have_attached_file(:image) }
end