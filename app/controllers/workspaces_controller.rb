class WorkspacesController < ApplicationController
  def index
    workspaces = Workspace.order("lower(name) ASC")
    workspaces = workspaces.active if params[:active]
    workspaces = workspaces.where(:owner_id => params[:user_id]) if params[:user_id]
    present workspaces.paginate(params.slice(:page, :per_page))
  end

  def create
    workspace = current_user.owned_workspaces.create!(params[:workspace])
    member = Membership.create!({:user => current_user, :workspace => workspace})
    present workspace, :status => :created
  end

  def show
    present AccessPolicy.workspaces_for(current_user).find(params[:id])
  end
end
