class MembersController < ApplicationController
  def index
    workspace = Workspace.find(params[:workspace_id])

    present AccessPolicy.workspace_members_for(current_user, workspace)
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :administrative_edit, workspace
    workspace.member_ids = params[:member_ids]
    workspace.save!
    present workspace.reload.members
  end
end
