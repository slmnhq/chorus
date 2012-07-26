require "spec_helper"
require 'timecop'

describe Workspace do
  describe "create" do
    it "creates a membership for the owner" do
      owner = users(:alice)
      workspace = owner.owned_workspaces.create!(:name => 'new workspace!')
      workspace.members.should include(owner)
    end
  end

  describe "validations" do
    it { should validate_presence_of :name }
    it { should validate_uniqueness_of(:name).case_insensitive }
  end

  describe ".active" do
    let!(:active_workspace) { workspaces(:alice_public) }
    let!(:archived_workspace) { workspaces(:archived) }

    it "returns only active workspaces" do
      workspaces = Workspace.active
      workspaces.should include(active_workspace)
      workspaces.should_not include(archived_workspace)
    end
  end

  describe ".accessible_to" do
    let!(:public_workspace) { workspaces(:bob_public) }
    let!(:owned_workspace) { workspaces(:alice_private)}
    let!(:private_workspace) { workspaces(:bob_private) }
    let!(:private_workspace_with_membership) { workspaces(:alice_private) }
    let(:user) { users(:alice) }

    it "returns public workspaces" do
      Workspace.accessible_to(user).should include public_workspace
    end

    it "returns private workspaces with membership" do
      Workspace.accessible_to(user).should include private_workspace_with_membership
    end

    it "returns private owned workspaces" do
      Workspace.accessible_to(user).should include owned_workspace
    end

    it "does not return private workspaces" do
      Workspace.accessible_to(user).should_not include private_workspace
    end
  end

  describe "#members_accessible_to" do
    let(:private_workspace) { workspaces(:alice_private) }
    let(:workspace) { workspaces(:alice_public) }

    let(:bob) { users(:bob) }
    let(:user) { users(:alice) }
    let(:admin) { users(:admin) }

    context "public workspace" do
      it "returns all members" do
        workspace.members << bob

        members = workspace.members_accessible_to(user)
        members.should include(bob, user)
      end
    end

    context "user is a member of a private workspace" do
      it "returns all members" do
        private_workspace.members << bob

        members = private_workspace.members_accessible_to(bob)
        members.should include(bob, user)
      end
    end

    context "user is not a member of a private workspace" do
      it "returns nothing" do
        private_workspace.members_accessible_to(bob).should be_empty
      end
    end
  end

  describe "#datasets" do
    let!(:schema) { FactoryGirl.create(:gpdb_schema) }
    let!(:other_schema) { FactoryGirl.create(:gpdb_schema) }
    let!(:sandbox_table) { FactoryGirl.create(:gpdb_table, :schema => schema) }
    let!(:source_table) { FactoryGirl.create(:gpdb_table, :schema => other_schema) }
    let!(:other_table) { FactoryGirl.create(:gpdb_table, :schema => other_schema) }

    before do
      workspace.bound_datasets << source_table
    end

    context "when the workspace has a sandbox" do
      let!(:workspace) { FactoryGirl.create(:workspace, :sandbox => schema) }

      it "includes datasets in the workspace's sandbox and all of its bound datasets" do
        workspace.datasets.should =~ [sandbox_table, source_table]
      end
    end

    context "when the workspace does not have a sandbox" do
      let!(:workspace) { FactoryGirl.create(:workspace, :sandbox => nil) }

      it "includes the workspace's bound datasets" do
        workspace.datasets.should =~ [source_table]
      end
    end

    context "when the workspace has no sandbox and no associated datasets" do
      let!(:workspace) { FactoryGirl.create(:workspace, :sandbox => nil) }

      before do
        workspace.associated_datasets.destroy_all
      end

      it "returns an empty relation" do
        workspace.datasets.should == []
      end
    end
  end

  describe "#image" do
    it "should have a nil image instead of a default missing image" do
      workspace = workspaces(:alice_public)
      workspace.update_attributes!(:image => nil)
      workspace.image.url.should == ""
    end
  end

  describe "#archive_as(user)" do
    let(:archive_time) { Time.now }
    let(:user) { users(:alice) }
    let(:workspace) { workspaces(:alice_public) }

    before do
      Timecop.freeze(archive_time) do
        workspace.archive_as(user)
      end
    end

    it "is archived by the correct user at the correct time" do
      workspace.archived_at.should == archive_time
      workspace.archiver.should == user
    end

    describe "#unarchive" do
      before do
        workspace.unarchive
      end

      it "clears the archived attributes" do
        workspace.archived_at.should be_nil
        workspace.archiver.should be_nil
      end
    end
  end

  it { should have_attached_file(:image) }

  describe "associations" do
    it { should have_many(:members) }
    it { should have_many(:activities) }
    it { should have_many(:events) }
  end

  describe "permissions_for" do
    it "should have the correct permissions per user" do
      owner = users(:alice)
      private_workspace = workspaces(:alice_private)
      public_workspace = workspaces(:alice_public)
      member = users(:carly)
      admin = users(:admin)
      anon = users(:bob)

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
    let(:active_workspace) { workspaces(:alice_public) }
    let(:archived_workspace) { workspaces(:archived) }

    it "says that active workspace is not archived" do
      active_workspace.should_not be_archived
    end

    it "says active workspace is not archived" do
      archived_workspace.should be_archived
    end
  end

  describe "#destroy" do
    let(:workspace) { workspaces(:alice_public) }

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

  describe "#has_dataset" do
    let(:workspace) { workspaces(:alice_public) }
    let(:dataset) { FactoryGirl.create(:gpdb_table) }

    it "returns true if the dataset is in the workspace's sandbox" do
      workspace.sandbox = dataset.schema
      workspace.has_dataset?(dataset).should be_true
    end

    it "returns true if the dataset has already been associated with the workspace" do
      workspace.bound_datasets << dataset
      workspace.has_dataset?(dataset).should be_true
    end

    it "returns false otherwise" do
      workspace.has_dataset?(dataset).should be_false
    end
  end

  describe "search fields" do
    it "indexes text fields" do
      Workspace.should have_searchable_field :name
      Workspace.should have_searchable_field :summary
    end
  end
end
