class WorkspaceDatasetsController < ApplicationController

  def index
    present paginate(workspace.datasets.order("lower(name)")), :presenter_options => { :workspace => workspace }
  end

  def create
    datasets = Dataset.where(:id => params[:dataset_ids])

    if datasets.any? { |dataset| workspace.has_dataset?(dataset) }
      present_errors({:fields => {:dataset => {:ALREADY_ASSOCIATED => {}}}}, :status => :bad_request)
    else
      workspace.bound_datasets << datasets
      datasets.each { |dataset| create_event_for_dataset(dataset, workspace) }
      render :json => {}, :status => :created
    end
  end

  def show
    present workspace.datasets.find(params[:id]), :presenter_options => { :workspace => workspace }
  end

  def destroy
    authorize! :can_edit_sub_objects, workspace
    dataset = AssociatedDataset.find_by_dataset_id_and_workspace_id(params[:id], params[:workspace_id])
    dataset.destroy
    render :json => {}
  end

  private

  def workspace
    @workspace ||= WorkspaceAccess.workspaces_for(current_user).find(params[:workspace_id])
  end

  def create_event_for_dataset(dataset, workspace)
    Events::SOURCE_TABLE_CREATED.by(current_user).add(
      :dataset => dataset,
      :workspace => workspace
    )
  end
end
