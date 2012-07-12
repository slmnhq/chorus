class MembersController < ApplicationController
  def index
    workspace = Workspace.find(params[:workspace_id])
    present WorkspaceAccess.members_for(current_user, workspace)
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :administrative_edit, workspace

    if params[:member_ids].include? workspace.owner_id.to_s
      workspace.member_ids = params[:member_ids]
      workspace.has_added_member = true
      workspace.save!
      present workspace.reload.members
    else
      present_errors({:fields => {:owner => {"Owner must be member" => {}}}}, :status => :bad_request)
    end
  end
end
