class WorkspacesController < ApplicationController
  def index
    authorize! :index
    workspaces = AccessPolicy.workspaces_for(current_user).order("lower(name) ASC")
    workspaces = workspaces.active if params[:active]
    workspaces = workspaces.where(:owner_id => params[:user_id]) if params[:user_id]
    present workspaces.paginate(params.slice(:page, :per_page))
  end

  def create
    authorize! :create
    workspace = Workspace.new(params[:workspace])
    workspace.owner = current_user
    workspace.save!
    membership = workspace.memberships.build
    membership.user = current_user
    membership.save!
    present workspace, :status => :created
  end

  def show
    # workspace = AccessPolicy.workspaces_for(current_user).find(params[:id])
    workspace = Workspace.find(params[:id])
    authorize! :show, workspace
    present workspace
  end

  def update
    workspace = Workspace.writable_by(current_user).find(params[:id])
    params[:workspace] = workspace.filter_writable_params(current_user, params[:workspace])
    params[:workspace].delete(:owner)

    update_archived_status(workspace)
    new_owner_id = params[:workspace].delete(:owner_id)
    workspace.owner = User.find(new_owner_id) if new_owner_id
    workspace.update_attributes!(params[:workspace])
    present workspace
  end

  private

  def update_archived_status(workspace)
    return unless params[:workspace].has_key?(:archived)
    if params[:workspace][:archived] == "true"
      workspace.archive_as(current_user)
    else
      workspace.unarchive
    end
  end
end
