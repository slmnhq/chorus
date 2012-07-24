require 'spec_helper'

describe WorkspacesController do
  ignore_authorization!

  let(:owner) { users(:alice) }
  before do
    log_in owner
  end

  describe "#index" do
    before do
      FactoryGirl.create(:workspace, :name => "Work", :owner => owner)
      FactoryGirl.create(:workspace, :name => "abacus", :archived_at => 2.days.ago)
      @private_workspace = FactoryGirl.create(:workspace, :public => false)
      @joined_private_workspace = FactoryGirl.create(:workspace, :public => false, :name => "secret1")
      owner.workspaces << @joined_private_workspace
    end

    it "returns all workspaces that are public or which the current user is a member of" do
      get :index
      response.code.should == "200"
      decoded_response.length.should == WorkspaceAccess.workspaces_for(owner).count
      decoded_response.map(&:name).should include("secret1")
    end

    it "does not return private workspaces" do
      FactoryGirl.create(:workspace, :name => "private", :public => false)
      get :index
      decoded_response.collect(&:name).should_not include "private"
    end

    it "includes private workspaces owned by the authenticated user" do
      FactoryGirl.create(:workspace, :name => "private", :public => false, :owner => owner)
      get :index
      decoded_response.collect(&:name).should include "private"
    end

    it "sorts by workspace name" do
      get :index
      decoded_response[0].name.downcase.should < decoded_response[1].name.downcase
    end

    it "scopes by active status" do
      get :index, :active => 1
      decoded_response.size.should == WorkspaceAccess.workspaces_for(owner).active.count
    end

    it "scopes by memberships" do
      get :index, :user_id => owner.id
      decoded_response.size.should == WorkspaceAccess.member_of_workspaces(owner).count
    end

    describe "pagination" do

      it "paginates the collection" do
        get :index, :page => 1, :per_page => 2
        decoded_response.length.should == 2
      end

      it "accepts a page parameter" do
        get :index, :page => 2, :per_page => 2
        decoded_response.first.name.should == WorkspaceAccess.workspaces_for(owner).order("lower(name) ASC")[2].name
      end

      it "defaults the per_page to fifty" do
        get :index
        request.params[:per_page].should == 50
      end
    end

    generate_fixture "workspaceSet.json" do
      get :index
    end

  end

  describe "#create" do
    context "with valid parameters" do
      let(:parameters) { { :workspace => { :name => "foobar"} } }

      it "creates a workspace" do
        lambda {
          post :create, parameters
        }.should change(Workspace, :count).by(1)
      end

      it "creates an event for public workspace" do
        parameters = { :workspace => { :name => "foobar", :public => true } }
        lambda {
          post :create, parameters
        }.should change(Events::PUBLIC_WORKSPACE_CREATED, :count).by(1)
      end

      it "creates an event for private workspace" do
        parameters = { :workspace => { :name => "foobar", :public => false } }
        lambda {
          post :create, parameters
        }.should change(Events::PRIVATE_WORKSPACE_CREATED, :count).by(1)
      end

      it "presents the workspace" do
        post :create, parameters
        parameters[:workspace].keys.each do |key|
          decoded_response[key].should == parameters[:workspace][key]
        end
      end

      it "adds the owner as a member of the workspace" do
        post :create, parameters
        Workspace.last.memberships.first.user.should == owner
      end

      it "sets the authenticated user as the owner of the new workspace" do
        post :create, parameters
        Workspace.last.owner.should == owner
      end
    end
  end

  describe "#show" do
    let(:joe) { FactoryGirl.create(:user) }
    let(:sandbox) { FactoryGirl.create(:gpdb_schema)}
    let(:workspace) { FactoryGirl.create(:workspace, :sandbox => sandbox) }

    context "with a valid workspace id" do
      it "uses authentication" do
        mock(subject).authorize!(:show, workspace)
        get :show, :id => workspace.to_param
      end

      it "succeeds" do
        get :show, :id => workspace.to_param
        response.should be_success
      end

      it "presents the workspace" do
        mock.proxy(controller).present(workspace)
        get :show, :id => workspace.to_param
      end
    end

    context "with an invalid workspace id" do
      it "returns not found" do
        get :show, :id => 'bogus'
        response.should be_not_found
      end
    end

    generate_fixture "workspace.json" do
      get :show, :id => workspace.to_param
    end
  end

  describe "#update" do
    let(:workspace) { FactoryGirl.create :workspace, :owner => owner }
    let(:sandbox) { FactoryGirl.create :gpdb_schema }
    let(:admin) { FactoryGirl.create :admin }
    let(:non_owner) { FactoryGirl.create :user }

    context "when the current user has administrative authorization" do
      it "uses authentication" do
        mock(subject).authorize!(:administrative_edit, workspace)
        put :update, :id => workspace.id, :workspace => {
          :owner => { id: "3" },
          :public => "false"
        }
      end

      it "allows updating the workspace's privacy and owner" do
        member = FactoryGirl.create(:user)
        member.workspaces << workspace

        put :update, :id => workspace.id, :workspace => {
          :owner_id => member.id.to_s,
          :public => "false"
        }

        workspace.reload
        workspace.should_not be_public
        workspace.owner.should == member
        response.should be_success
      end

      it "sets has_changed_settings on the workspace to true" do
        member = FactoryGirl.create(:user)
        member.workspaces << workspace

        put :update, :id => workspace.id, :workspace => {
            :owner_id => member.id.to_s,
            :public => "false"
        }

        workspace.reload.has_changed_settings.should be_true
      end

      it "allows archiving the workspace" do
        put :update, :id => workspace.id, :workspace => {
            :archived => "true"
        }
        workspace.reload
        workspace.archived_at.should_not be_nil
        workspace.archiver.should == owner
      end

      it "allows unarchiving the workspace" do
        workspace.archive_as(owner)
        workspace.save!

        put :update, :id => workspace.id, :workspace => {
          :archived => "false"
        }

        workspace.reload
        workspace.archived_at.should be_nil
        workspace.archiver.should be_nil
      end

      it "allows changing the sandbox" do
        put :update, :id => workspace.id, :workspace => {
            :sandbox_id => sandbox.to_param
        }

        workspace.reload
        workspace.sandbox_id.should == sandbox.id
        workspace.has_added_sandbox.should == true
        workspace.has_changed_settings.should == false

        events = Events::WORKSPACE_ADD_SANDBOX.by(owner)
        events.count.should == 1
      end
    end

    context "when the current user has membership access" do
      it "uses authentication" do
        mock(subject).authorize!(:member_edit, workspace)
        get :update, :id => workspace.to_param
      end

      it "allows updates to name and summary" do
        put :update, :id => workspace.id, :workspace => {
          :name => "new name",
          :summary => "new summary"
        }
        workspace.reload
        workspace.name.should == "new name"
        workspace.summary.should == "new summary"
        response.should be_success
      end

      it "uses schema authentication" do
        mock(subject).authorize!(:show_contents, sandbox.instance)
        put :update, :id => workspace.to_param, :workspace => {:sandbox_id => sandbox.to_param}
      end
    end

    context "creating sandbox" do
      let!(:dataset_view) { datasets(:bobs_view)}
      let(:new_dataset) { datasets(:other_table) }

      let(:owner) { users(:bob) }
      let(:workspace_new) { FactoryGirl.create :workspace, :owner => owner }
      let!(:owner_account) { FactoryGirl.create(:instance_account, :instance => dataset_view.instance, :owner => owner) }
      let!(:association) { FactoryGirl.create(:associated_dataset, :dataset => dataset_view, :workspace => workspace_new) }
      let(:datasets1) { fake_relation [new_dataset, dataset_view] }
      before :each do
        stub(dataset_view.schema).datasets { datasets1 }
        mock(subject).authorize!(:administrative_edit, workspace_new)
        stub(Dataset).refresh {  }
      end
      it "delete any already associated datasets" do
        put :update, :id => workspace_new.id, :workspace => {
            :sandbox_id => dataset_view.schema.to_param
        }
        AssociatedDataset.find_by_dataset_id_and_workspace_id(dataset_view.to_param, workspace_new.to_param).should be_nil
      end
    end
  end
end
