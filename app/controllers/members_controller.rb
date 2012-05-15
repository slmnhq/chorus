class MembersController < ApplicationController
  def index
    workspace = Workspace.find(params[:workspace_id])

    present AccessPolicy.workspace_members_for(current_user, workspace)
  end
end
