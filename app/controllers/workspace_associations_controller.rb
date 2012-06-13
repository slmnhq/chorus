class WorkspaceAssociationsController < ApplicationController
  def index
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    present workspace.gpdb_database_objects
  end

  def create
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    workspace.gpdb_database_objects << GpdbDatabaseObject.find(params[:gpdb_database_object_id])

    head :ok
  end
end
