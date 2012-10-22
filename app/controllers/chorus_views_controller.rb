class ChorusViewsController < ApplicationController
  wrap_parameters :chorus_view, :exclude => [:id]

  def create
    chorus_view_params = params[:chorus_view]
    chorus_view = ChorusView.new
    chorus_view.name = chorus_view_params[:object_name]
    chorus_view.schema = GpdbSchema.find(chorus_view_params[:schema_id])
    chorus_view.query = chorus_view_params[:query]

    workspace = Workspace.find(chorus_view_params[:workspace_id])

    if (chorus_view_params[:source_object_type] == 'workfile')
      source_object = Workfile.find(chorus_view_params[:source_object_id])
    else
      source_object = Dataset.find(chorus_view_params[:source_object_id])
    end

    ChorusView.transaction do
      chorus_view.save!
      workspace.bound_datasets << chorus_view
      Events::ChorusViewCreated.by(current_user).add(
          :workspace => workspace,
          :source_object => source_object,
          :dataset => chorus_view
      )
    end

    present chorus_view, :presenter_options => {:workspace => workspace}, :status => :created
  end

  def update
    chorus_view = ChorusView.find(params[:id])
    authorize! :can_edit_sub_objects, chorus_view.workspace
    chorus_view.query = params[:query] || params[:workspace_dataset][:query]
    chorus_view.save!

    Events::ChorusViewChanged.by(current_user).add(
        :workspace => chorus_view.workspace,
        :dataset => chorus_view
    )
    present chorus_view
  end

  def destroy
    ChorusView.find(params[:id]).destroy
    AssociatedDataset.find_by_dataset_id(params[:id]).destroy
    schedule = ImportSchedule.find_by_source_dataset_id(params[:id])
    schedule.destroy unless schedule.nil?

    render :json => {}
  end

  def convert
    ChorusView.find(params[:id]).convert_to_database_view(params[:object_name], current_user)
    render :json => {}, :status => 200
  end
end