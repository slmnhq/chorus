require 'spec_helper'

describe WorkspacesController do
  before do
    @user = FactoryGirl.create(:user)
    log_in @user
    @workspace1 = FactoryGirl.create(:workspace, :name => "Work", :owner => @user)
    @workspace2 = FactoryGirl.create(:workspace, :name => "abacus", :archived_at => 2.days.ago)
  end

  describe "#index" do
    it_behaves_like "an action that requires authentication", :get, :index

    it "returns all workspaces (access control not implemented)" do
      get :index
      response.code.should == "200"
      decoded_response.length.should == 2
    end

    it "sorts by workspace name" do
      get :index
      decoded_response[0].name.should == "abacus"
      decoded_response[1].name.should == "Work"
    end

    it "scopes by active status" do
      get :index, :active => 1
      decoded_response.size.should == 1
      decoded_response[0].name.should == "Work"
    end

    it "scopes by owner" do
      get :index, :user_id => @user.id
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
        decoded_response.second.name.should == "Work"
      end

      it "accepts a page parameter" do
        get :index, :page => 2, :per_page => 2
        decoded_response.length.should == 1
        decoded_response.first.name.should == "zed"
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

      it "sets the authenticated user as the owner of the new workspace" do
        post :create, parameters
        Workspace.last.owner.should == @user
      end
    end
  end
end
