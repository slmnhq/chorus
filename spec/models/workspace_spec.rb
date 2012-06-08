require "spec_helper"
describe Workspace do
  describe "validations" do
    before(:each) do
      FactoryGirl.create(:workspace)
    end

    it { should validate_presence_of :name }
    it { should validate_uniqueness_of(:name).case_insensitive }
  end

  describe ".active" do
    let!(:active_workspace) { FactoryGirl.create :workspace }
    let!(:archived_workspace) { FactoryGirl.create :workspace, :archived_at => 2.days.ago }

    it "returns only active workspaces" do
      workspaces = Workspace.active
      workspaces.should have(1).workspace
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

  describe "#members_accessible_to" do
    let(:private_workspace) { FactoryGirl.create(:workspace, :public => false) }
    let(:workspace) { FactoryGirl.create(:workspace, :public => true) }

    let(:joe) { FactoryGirl.create(:user) }
    let(:user) { FactoryGirl.create(:user) }
    let(:admin) { FactoryGirl.create(:admin) }

    context "public workspace" do
      it "returns all members" do
        workspace.members << joe

        members = workspace.members_accessible_to(user)
        members.should have(2).members # including the owner
      end
    end

    context "user is a member of a private workspace" do
      it "returns all members" do
        workspace.members << user
        workspace.members << joe

        members = workspace.members_accessible_to(user)
        members.should have(3).members # including the owner
      end
    end

    context "user is not a member of a private workspace" do
      it "returns nothing" do
        workspace.members << joe
        workspace.update_attributes :public => false

        members = workspace.members_accessible_to(user)
        members.should be_empty
      end
    end
  end

  describe "#image" do
    it "should have a nil image instead of a default missing image" do
      workspace = FactoryGirl.create(:workspace, :image => nil)
      workspace.image.url.should == ""
    end
  end

  describe "#archive_as(user)" do
    let(:archive_time) { Time.now }
    let(:user) { FactoryGirl.create :user }

    before do
      Timecop.freeze(archive_time)
      subject.archive_as(user)
    end

    its(:archived_at) { should == archive_time }
    its(:archiver) { should == user }

    describe "#unarchive" do
      before do
        subject.unarchive
      end

      its(:archived_at) { should be_nil }
      its(:archiver) { should be_nil }
    end
  end

  it { should have_attached_file(:image) }

  describe "associations" do
    it { should have_many(:members) }
  end

  describe "permissions_for" do
    it "should have the correct permissions per user" do
      owner = FactoryGirl.create(:user)
      private_workspace = FactoryGirl.create(:workspace, :public => false, :owner => owner)
      member = FactoryGirl.create(:user)
      member.workspaces << private_workspace
      admin = FactoryGirl.create(:admin)
      anon = FactoryGirl.create(:user)
      public_workspace = FactoryGirl.create(:workspace, :public => true)

      [
        [private_workspace, owner, [:admin]],
        [private_workspace, member, [:read, :commenting, :update]],
        [private_workspace, admin, [:admin]],
        [private_workspace, anon, []],
        [public_workspace, anon, [:read, :commenting]]
      ].each do |workspace, user, list|
        workspace.permissions_for(user).should == list
      end
    end
  end

  describe "#archived?" do
    let(:active_workspace) { FactoryGirl.create :workspace }
    let(:archived_workspace) { FactoryGirl.create :workspace, :archived_at => 2.days.ago }

    it "says that active workspace is not archived" do
      active_workspace.should_not be_archived
    end

    it "says active workspace is not archived" do
      archived_workspace.should be_archived
    end
  end

  describe "#destroy" do
    let(:workspace) { FactoryGirl.create :workspace }

    before do
      workspace.destroy
    end

    it "should not delete the database entry" do
      Workspace.find_with_destroyed(workspace.id).should_not be_nil
    end

    it "should update the deleted_at field" do
      Workspace.find_with_destroyed(workspace.id).deleted_at.should_not be_nil
    end

    it "should be hidden from subsequent #find calls" do
      Workspace.find_by_id(workspace.id).should be_nil
    end
  end
end
