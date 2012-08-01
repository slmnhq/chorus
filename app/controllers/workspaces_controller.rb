class WorkspacesController < ApplicationController
  def index
    if params[:user_id]
      user = User.find(params[:user_id])
      workspaces = user.workspaces
    else
      workspaces = WorkspaceAccess.workspaces_for(current_user)
    end
    workspaces = workspaces.active if params[:active]
    present paginate(workspaces.order("lower(name) ASC"))
  end

  def create
    workspace = current_user.owned_workspaces.build(params[:workspace])
    Workspace.transaction do
      workspace.save!
      workspace.public ?
          Events::PUBLIC_WORKSPACE_CREATED.by(current_user).add(:workspace => workspace) :
          Events::PRIVATE_WORKSPACE_CREATED.by(current_user).add(:workspace => workspace)
    end
    present workspace, :status => :created
  end

  def show
    workspace = Workspace.find(params[:id])
    authorize! :show, workspace
    present workspace
  end

  def update
    workspace = Workspace.find(params[:id])
    params[:workspace][:archiver] = current_user if params[:workspace][:archived] == 'true'
    workspace.attributes = params[:workspace]
    authorize! :update, workspace
    Workspace.transaction do
      create_workspace_events(workspace)
      workspace.save!
    end

    present workspace
  end

  private

  def create_workspace_events(workspace)
    if workspace.public_changed?
      workspace.public ?
          Events::WORKSPACE_MAKE_PUBLIC.by(current_user).add(:workspace => workspace) :
          Events::WORKSPACE_MAKE_PRIVATE.by(current_user).add(:workspace => workspace)
    end

    if workspace.archived_at_changed?
      workspace.archived? ?
          Events::WORKSPACE_ARCHIVED.by(current_user).add(:workspace => workspace) :
          Events::WORKSPACE_UNARCHIVED.by(current_user).add(:workspace => workspace)
    end

    if workspace.sandbox_id_changed? && workspace.sandbox
      Events::WORKSPACE_ADD_SANDBOX.by(current_user).add(
          :sandbox_schema => workspace.sandbox,
          :workspace => workspace
      )
    end
  end
end
