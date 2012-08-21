class WorkspaceDatasetsController < ApplicationController

  def index
    present paginate(workspace.datasets.with_name_like(params[:name_pattern]).order("lower(name)")), :presenter_options => { :workspace => workspace }
  end

  def create
    datasets = Dataset.where(:id => params[:dataset_ids].split(","))

    datasets.each do |dataset|
      unless workspace.has_dataset?(dataset)
        workspace.bound_datasets << dataset
        create_event_for_dataset(dataset, workspace)
      end
    end

    render :json => {}, :status => :created
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
    @workspace ||= Workspace.workspaces_for(current_user).find(params[:workspace_id])
  end

  def create_event_for_dataset(dataset, workspace)
    Events::SourceTableCreated.by(current_user).add(
      :dataset => dataset,
      :workspace => workspace
    )
  end
end
