class WorkspaceDatasetsController < ApplicationController

  def index
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    present workspace.associated_datasets
  end

  def create
    workspace = WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
    datasets = Dataset.where(:id => params[:dataset_ids])
    workspace.bound_datasets << datasets
    datasets.each { |dataset| create_event_for_dataset(dataset, workspace) }

    present workspace.associated_datasets
  end

  def show
    present AssociatedDataset.where(:dataset_id => params[:id], :workspace_id => params[:workspace_id]).first
  end

  private

  def create_event_for_dataset(dataset, workspace)
    Events::SOURCE_TABLE_CREATED.by(current_user).add(
      :dataset => dataset,
      :workspace => workspace
    )
  end
end
