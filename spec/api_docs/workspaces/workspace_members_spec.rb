require 'spec_helper'

resource "Workspaces" do
  let(:owner) { users(:owner) }
  let(:user1) { users(:no_collaborators) }
  let!(:workspace) { workspaces(:public) }
  let!(:workspace_id) { workspace.to_param }

  before do
    log_in owner
  end

  post "/workspaces/:workspace_id/members" do
    parameter :workspace_id, "Id of a workspace"
    parameter :'member_ids[]', "Ids of Users to add as a member to the workspace"

    let(:'member_ids[]') { [user1.id, owner.id] }

    required_parameters :'member_ids[]', :workspace_id

    example_request "Add a member to the workspace" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/members" do
    parameter :workspace_id, "Id of a workspace"
    pagination

    required_parameters :workspace_id

    example_request "Get a list of members of the workspace" do
      status.should == 200
    end
  end

end


