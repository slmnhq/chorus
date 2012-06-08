class WorkspacesController < ApplicationController
  def index
    workspaces = WorkspaceAccess.workspaces_for(current_user).order("lower(name) ASC")
    workspaces = workspaces.active if params[:active]
    workspaces = WorkspaceAccess.member_of_workspaces(current_user) if params[:user_id]
    present workspaces.paginate(params.slice(:page, :per_page))
  end

  def create
    workspace = current_user.owned_workspaces.create!(params[:workspace])
    membership = workspace.memberships.build
    membership.user = current_user
    membership.save!
    present workspace, :status => :created
  end

  def show
    workspace = Workspace.find(params[:id])
    authorize! :show, workspace
    present workspace
  end

  def update
    w = params[:workspace] || {}
    workspace = Workspace.find(params[:id])

    if w.has_key?(:owner_id) && (workspace.owner.id.to_s != w[:owner_id])
      authorize! :administrative_edit, workspace
      workspace.owner = User.find(w[:owner_id])
    end

    if workspace.public.to_s != w[:public]
      authorize! :administrative_edit, workspace
      workspace.public = w[:public]
    end

    if w.has_key?(:archived) && (!!workspace.archived_at).to_s != w[:archived]
      authorize! :administrative_edit, workspace
      update_archived_status(workspace)
    end

    authorize! :member_edit, workspace
    workspace.update_attributes!(params[:workspace])
    present workspace
  end

  private

  def update_archived_status(workspace)
    if params[:workspace][:archived] == "true"
      workspace.archive_as(current_user)
    else
      workspace.unarchive
    end
  end
end
