class MembersController < ApplicationController
  def index
    workspace = Workspace.find(params[:workspace_id])
    present WorkspaceAccess.members_for(current_user, workspace)
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :owner, workspace
    workspace.update_attributes!(:member_ids => params[:member_ids], :has_added_member => true)
    present workspace.reload.members
  end
end