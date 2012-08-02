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
    (member_ids - workspace.members.map(&:id).map(&:to_s)).each do |new_member_id|
      member = User.find(new_member_id)
      Events::MEMBER_ADDED.by(current_user).add(:workspace => workspace, :member => member)
    end
  end
end