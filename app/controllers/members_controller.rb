class MembersController < ApplicationController
  def index
    workspace = Workspace.find(params[:workspace_id])
    present WorkspaceAccess.members_for(current_user, workspace)
  end

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :owner, workspace

    create_events(workspace, params[:member_ids])

    workspace.update_attributes!(:member_ids => params[:member_ids], :has_added_member => true)
    present workspace.reload.members
  end

  private

  def create_events(workspace, member_ids)
    added_members = member_ids - workspace.members.map(&:id).map(&:to_s)
    member = User.find(added_members.first)
    num_added = added_members.count
    Events::MEMBERS_ADDED.by(current_user).add(:workspace => workspace, :member => member, :num_added => num_added)
  end
end