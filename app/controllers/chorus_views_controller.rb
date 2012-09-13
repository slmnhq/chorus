class ChorusViewsController < ApplicationController
  def create
    param = params[:chorus_view]
    chorus_view = ChorusView.new
    chorus_view.name = param[:object_name]
    chorus_view.schema = GpdbSchema.find(param[:schema_id])
    chorus_view.query = param[:query]

    workspace = Workspace.find(param[:workspace_id])

    if (param[:source_object_type] == 'workfile')
      source_object = Workfile.find(param[:source_object_id])
    else
      source_object = Dataset.find(param[:source_object_id])
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
end