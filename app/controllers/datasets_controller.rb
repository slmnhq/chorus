class DatasetsController < ApplicationController

  def index
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    present workspace.gpdb_database_object_workspace_associations
  end

  def create
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    workspace.gpdb_database_objects << GpdbDatabaseObject.where(:id => params[:datasetIds])

    present workspace.gpdb_database_object_workspace_associations
  end

  def show
    present GpdbDatabaseObjectWorkspaceAssociation.find(params[:id])
  end
end
