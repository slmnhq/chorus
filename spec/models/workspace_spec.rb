require "spec_helper"
require 'timecop'

describe Workspace do
  describe "associations" do
    it { should have_many(:members) }
    it { should have_many(:activities) }
    it { should have_many(:events) }
    it { should belong_to(:sandbox) }
  end

  describe "create" do
    it "creates a membership for the owner" do
      owner = users(:alice)
      workspace = owner.owned_workspaces.create!(:name => 'new workspace!')
      workspace.members.should include(owner)
    end
  end

  describe "validations" do
    let(:workspace) { workspaces(:alice_public) }

    it { should validate_presence_of :name }
    it { should validate_uniqueness_of(:name).case_insensitive }


    context "validate file sizes" do
      it "gives an error when file is too big" do
        stub(workspace.image).size { 9999999999999999999999999999999999999 }
        workspace.should_not be_valid
      end

      it "is ok with reasonable file sizes" do
        stub(workspace.image).size { 4 }
        workspace.should be_valid
      end
    end
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

  describe ".workspaces_for" do
    context "user is admin" do
      let(:admin) { users(:admin) }
      it "returns unscoped workspaces" do
        mock(Workspace).scoped

        described_class.workspaces_for(admin)
      end
    end

    context "user is not admin" do
      let(:user) { users(:bob) }
      it "returns limited workspaces" do
        mock(Workspace).accessible_to(user)

        described_class.workspaces_for(user)
      end
    end
  end

  describe ".accessible_to" do
    let!(:public_workspace) { workspaces(:bob_public) }
    let!(:owned_workspace) { workspaces(:alice_private) }
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
    let!(:sandbox_view) { FactoryGirl.create(:gpdb_view, :schema => schema) }
    let!(:source_table) { FactoryGirl.create(:gpdb_table, :schema => other_schema) }
    let!(:other_table) { FactoryGirl.create(:gpdb_table, :schema => other_schema) }
    let(:chorus_view) {
      ChorusView.new({:name => "chorus_view", :schema => schema, :query => "select * from a_table"}, :without_protection => true)
    }
    let!(:user) {users(:carly)}

    context "when the workspace has a sandbox" do
      before do
        chorus_view.save!(:validate => false)
        workspace.bound_datasets << chorus_view
        workspace.bound_datasets << source_table
      end
      let!(:workspace) { FactoryGirl.create(:workspace, :sandbox => schema) }

      context "when the user does not have an instance account" do
        it "lets them see associated datasets and chorus views only" do
          workspace.datasets(user).should =~ [source_table, chorus_view]
        end
      end

      context "when the user has an instance account" do
        let!(:account) { FactoryGirl.create(:instance_account, :gpdb_instance => schema.database.gpdb_instance, :owner => user) }

        context "when the sandbox has tables" do
          before do
            stub(Dataset).refresh(account, schema) {[sandbox_table, sandbox_view] }
          end

          it "includes datasets in the workspace's sandbox and all of its bound datasets" do
            workspace.datasets(user).should =~ [sandbox_table, source_table, chorus_view, sandbox_view]
          end

          it "filters by type" do
            workspace.datasets(user, "SANDBOX_TABLE").should =~ [sandbox_table]
            workspace.datasets(user, "SANDBOX_DATASET").should =~ [sandbox_table, sandbox_view]
            workspace.datasets(user, "CHORUS_VIEW").should =~ [chorus_view]
            workspace.datasets(user, "SOURCE_TABLE").should =~ [source_table]
          end
        end

        context "when there are no datasets for this workspace" do
          before do
            stub(Dataset).refresh(account, schema) { [] }
          end

          it "returns no results" do
            workspace.datasets(user, "SANDBOX_TABLE" ).should =~ []
            workspace.datasets(user, "SANDBOX_DATASET").should =~ []
          end
        end
      end
    end

    context "when the workspace does not have a sandbox" do
      let!(:workspace) { FactoryGirl.create(:workspace, :sandbox => nil) }
      before do
        workspace.bound_datasets << source_table
      end

      it "includes the workspace's bound datasets" do
        workspace.datasets(user).should =~ [source_table]
      end
    end

    context "when the workspace has no sandbox and no associated datasets" do
      let!(:workspace) { FactoryGirl.create(:workspace, :sandbox => nil) }

      before do
        workspace.associated_datasets.destroy_all
      end

      it "returns an empty relation" do
        workspace.reload.datasets(user).should == []
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

  it { should have_attached_file(:image) }

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

  describe "#member?" do
    it "is true for members" do
      workspaces(:bob_public).member?(users(:bob)).should be_true
    end

    it "is false for non members" do
      workspaces(:bob_public).member?(users(:alice)).should be_false
    end
  end

  describe "#archived=" do
    context "when setting to 'true'" do
      let(:workspace) { workspaces(:bob_public) }
      let(:archiver) { users(:bob) }
      it "sets the archived_at timestamp" do
        workspace.update_attributes!(:archiver => archiver, :archived => 'true')
        workspace.archived_at.should be_within(1.minute).of(Time.current)
      end

      it "has a validation error when archiver is not set" do
        workspace.update_attributes(:archived => 'true')
        workspace.should have(1).error_on(:archived)
      end
    end

    context "when setting to 'false'" do
      let(:workspace) { workspaces(:archived) }
      it "clears the archived_at timestamp and archiver" do
        workspace.update_attributes(:archived => 'false')
        workspace.archived_at.should be_nil
        workspace.archiver.should be_nil
      end
    end
  end

  describe "callbacks" do
    let(:workspace) { workspaces(:alice_public) }
    let(:sandbox) { gpdb_schemas(:bobs_schema) }

    describe "before_save" do
      describe "update_has_added_sandbox" do
        it "sets if passed a valid sandbox_id" do
          workspace.sandbox_id = sandbox.id
          workspace.save!
          workspace.should have_added_sandbox
        end

        it "does not set it if passed an invalid sandbox_id" do
          workspace.sandbox_id = 8675309
          workspace.save
          workspace.should_not have_added_sandbox
        end

        it "does not unset it if sandbox is removed" do
          workspace = workspaces(:bob_public)
          workspace.sandbox_id = nil
          workspace.save!
          workspace.should have_added_sandbox
        end
      end
    end

    describe "before_update" do
      describe "update_has_changed_settings" do
        it "sets if changing random attributes" do
          workspace.name = 'new name'
          workspace.save!
          workspace.should have_changed_settings
        end

        it "does not set if changing sandbox_id" do
          workspace.sandbox_id = sandbox.id
          workspace.save!
          workspace.should_not have_changed_settings
        end
      end

      describe "clear_assigned_datasets_on_sandbox_assignment" do
        let(:sandbox_dataset) { sandbox.datasets.first }
        let(:other_dataset) { datasets(:other_table) }

        before do
          workspace.bound_datasets << sandbox_dataset
          workspace.bound_datasets << other_dataset
          workspace.sandbox_id = sandbox.id
          workspace.save!
        end

        it "removes duplicate datasets" do
          workspace.bound_datasets.should_not include(sandbox_dataset)
          sandbox_dataset.reload.should_not be_nil
        end

        it "does not remove datasets from other schemas" do
          workspace.bound_datasets.should include(other_dataset)
        end
      end
    end
  end
end