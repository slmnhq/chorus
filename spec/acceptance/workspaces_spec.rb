require 'spec_helper'

resource "Workspaces" do
  let!(:user) { FactoryGirl.create :admin }
  let!(:workspace) { FactoryGirl.create :workspace, :owner => user }

  before do
    log_in user
  end

  get "/workspaces" do
    parameter :active, "1 if you only want active workspaces, 0 if you want all workspaces. Defaults to all workspaces if the parameter is not provided"
    parameter :user_id, "If provided, only return workspaces belonging to the specified user"

    example_request "Get a list of workspaces" do
      status.should == 200
    end
  end

  get "/workspaces/:id" do
    let(:id) { workspace.to_param }

    example_request "Show workspace details" do
      status.should == 200
    end
  end

  put "/workspaces/:id" do
    let(:id) { workspace.to_param }

    parameter :name, "Workspace name"
    parameter :public, "1 if the workspace should be public, 0 if it should be private. Defaults to public if the parameter is not provided."
    parameter :summary, "Notes about the workspace"

    required_parameters :name
    scope_parameters :workspace, :all

    let(:name) { "Bwesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "I like big data and I cannot lie, all the other coders can't deny" }

    example_request "Update workspace details" do
      status.should == 200
    end
  end

  post "/workspaces" do
    parameter :name, "Workspace name"
    parameter :public, "1 if the workspace should be public, 0 if it should be private. Defaults to public if the parameter is not provided."
    parameter :summary, "Notes about the workspace"

    required_parameters :name
    scope_parameters :workspace, :all

    let(:name) { "Awesome Workspace" }
    let(:public) { "1" }
    let(:summary) { "Lots of good data in here" }

    example_request "Create a workspace" do
      status.should == 201
    end
  end
end
