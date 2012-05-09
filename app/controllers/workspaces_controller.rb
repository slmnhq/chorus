class WorkspacesController < ApplicationController
  def index
    workspaces = Workspace.scoped
    workspaces = workspaces.active if params[:active]
    workspaces = workspaces.where(:owner_id => params[:user_id]) if params[:user_id]
    present workspaces
  end

  def create
    present current_user.workspaces.create!(params[:workspace]), :status => :created
  end
end
