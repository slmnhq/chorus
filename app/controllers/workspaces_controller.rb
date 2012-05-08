class WorkspacesController < ApplicationController
  def index
    present Workspace.all
  end

  def create
    present current_user.workspaces.create!(params[:workspace]), :status => :created
  end
end
