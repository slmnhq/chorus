class MembersController < ApplicationController
  def index
    workspace = Workspace.find(params[:workspace_id])

    present AccessPolicy.workspace_members_for(current_user, workspace)
  end

  def create
    workspace = Workspace.membership_editable_by(current_user).find(params[:workspace_id])
    workspace.member_ids = params[:member_ids]
    workspace.save!
    present workspace.reload.members
  end
end
