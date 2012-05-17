require 'spec_helper'

describe WorkspacesController do
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

    it_behaves_like "an action that requires authentication", :get, :index

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
      decoded_response[0].name.should == "secret1"
      decoded_response[1].name.should == "Work"
    end

    it "scopes by owner" do
      get :index, :user_id => owner.id
      decoded_response.size.should == 1
      decoded_response[0].name.should == "Work"
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
  end

  describe "#create" do
    it_behaves_like "an action that requires authentication", :post, :create

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

    before do
      log_in owner
    end

    it_behaves_like "an action that requires authentication", :get, :show

    context "with a valid workspace id" do
      let(:workspace) { FactoryGirl.create(:workspace) }

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

    context "of a private workspace" do
      let(:workspace) { FactoryGirl.create(:workspace, :public => false) }

      it "returns not found for a non-member" do
        log_in joe
        get :show, :id => workspace.to_param
        response.should be_not_found
      end
    end
    #it "generates a jasmine fixture", :fixture => true do
    #  get :show, :id => @other_user.to_param
    #  save_fixture "user.json"
    #end
  end

  describe "#update" do
    let(:workspace) { FactoryGirl.create :workspace, :owner => owner }
    let(:admin) { FactoryGirl.create :admin }
    let(:non_owner) { FactoryGirl.create :user }

    context "when the current user is the workspace's owner" do
      it "allows updating the workspace's name, summary, and privacy" do
        do_request

        workspace.reload
        workspace.name.should == "new name"
        workspace.summary.should == "new summary"
        workspace.should_not be_public
        response.should be_success
      end
    end

    context "when the current user is an admin" do
      it "allows updating the workspace's name, summary, and privacy" do
        log_in admin
        do_request

        workspace.reload
        workspace.name.should == "new name"
        workspace.summary.should == "new summary"
        workspace.should_not be_public
        response.should be_success
      end
    end

    context "when the current user is just a member" do
      it "allows updates to name and summary" do
        member_non_owner = FactoryGirl.create(:user)
        member_non_owner.workspaces << workspace
        log_in member_non_owner

        put :update, :id => workspace.id, :workspace => {
          :name => "new name",
          :summary => "new summary"
        }
        response.should be_success
      end

      it "does not allow updates to other attrs" do
        member_non_owner = FactoryGirl.create(:user)
        member_non_owner.workspaces << workspace
        log_in member_non_owner

        do_request
        workspace.reload
        workspace.public.should be_true
        workspace.name.should == "new name"
        workspace.summary.should == "new summary"
      end
    end

    context "when the current user is NOT an admin or a member" do
      it "does not allow updates" do
        log_in non_owner
        do_request

        workspace.reload
        workspace.name.should_not == "new name"
        workspace.summary.should_not == "new summary"
        workspace.should be_public
        response.should be_not_found
      end
    end

    def do_request
      put :update, :id => workspace.id, :workspace => {
        :name => "new name",
        :summary => "new summary",
        :public => false
      }
    end
  end
end
