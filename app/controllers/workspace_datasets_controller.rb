class WorkspaceDatasetsController < ApplicationController

  def index
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    present workspace.associated_datasets
  end

  def create
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    workspace.bound_datasets << Dataset.where(:id => params[:dataset_ids])

    present workspace.associated_datasets
  end

  def show
    present AssociatedDataset.where(:dataset_id => params[:id], :workspace_id => params[:workspace_id]).first
  end
end
