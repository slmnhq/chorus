require 'spec_helper'

describe WorkspacesController do
  ignore_authorization!

  let(:owner) { FactoryGirl.create(:user)}
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
      decoded_response.length.should == 3
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
      decoded_response[0].name.should == "abacus"
      decoded_response[1].name.should == "secret1"
      decoded_response[2].name.should == "Work"
    end

    it "scopes by active status" do
      get :index, :active => 1
      decoded_response.size.should == 2
      decoded_response.map(&:name).should =~ ["secret1", "Work"]
    end

    it "scopes by memberships" do
      get :index, :user_id => owner.id
      decoded_response.size.should == 2
      decoded_response.map(&:name).should =~ ["secret1", "Work"]
    end

    describe "pagination" do
      before do
        FactoryGirl.create(:workspace, :name=> 'zed')
      end

      it "paginates the collection" do
        get :index, :page => 1, :per_page => 2
        decoded_response.length.should == 2
      end

      it "defaults to page one" do
        get :index, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.name.should == "abacus"
        decoded_response.second.name.should == "secret1"
      end

      it "accepts a page parameter" do
        get :index, :page => 2, :per_page => 2
        decoded_response.length.should == 2
        decoded_response.first.name.should == "Work"
        decoded_response.last.name.should == "zed"
      end

      it "defaults the per_page to fifty" do
        get :index
        request.params[:per_page].should == 50
      end
    end

    it "generates a JSON fixture", :fixture => true do
      get :index
      save_fixture "workspaceSet.json"
    end

  end

  describe "#create" do
    context "with valid parameters" do
      let(:parameters) { { :workspace => { :name => "foobar" } } }

      it "creates a workspace" do
        lambda {
          post :create, parameters
        }.should change(Workspace, :count).by(1)
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
    let(:workspace) { FactoryGirl.create(:workspace) }

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

    it "generates a JSON fixture", :fixture => true do
      get :show, :id => workspace.to_param
      save_fixture "workspace.json"
    end
  end

  describe "#update" do
    let(:workspace) { FactoryGirl.create :workspace, :owner => owner }
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
    end
  end
end
