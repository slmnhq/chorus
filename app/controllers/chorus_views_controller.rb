class ChorusViewsController < ApplicationController
  def create
    param = params[:chorus_view]
    chorus_view = ChorusView.new
    chorus_view.name = param[:object_name]
    chorus_view.schema = GpdbSchema.find(param[:schema_id])
    chorus_view.query = param[:query]

    workspace = Workspace.find(param[:workspace_id])

    ChorusView.transaction do
      chorus_view.save!
      workspace.bound_datasets << chorus_view
    end

    present chorus_view, :presenter_options => {:workspace => workspace}, :status => :created
  end
end
