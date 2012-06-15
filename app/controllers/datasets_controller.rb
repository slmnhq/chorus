class DatasetsController < ApplicationController

  def index
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    present workspace.associated_datasets
  end

  def create
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    workspace.gpdb_database_objects << GpdbDatabaseObject.where(:id => params[:dataset_ids])

    present workspace.associated_datasets
  end

  def show
    present AssociatedDataset.find(params[:id])
  end
end
