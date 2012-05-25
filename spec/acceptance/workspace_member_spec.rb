require 'spec_helper'

resource "Workspace Members" do
  let!(:owner) { FactoryGirl.create :user }
  let!(:user1) { FactoryGirl.create :user }
  let!(:workspace) { FactoryGirl.create(:workspace, :owner => owner ) }
  let!(:workspace_id) { workspace.to_param }

  before do
    log_in owner
  end

  post "/workspaces/:workspace_id/members" do
    parameter :member_ids, "User ids"

    let(:member_ids) { [user1.id, owner.id] }

    required_parameters :member_ids

    example_request "Creates a member for the workspace" do
      status.should == 200
    end
  end

  get "/workspaces/:workspace_id/members" do

    example_request "Get a list of members of the workspace " do
      status.should == 200
    end
  end

end


