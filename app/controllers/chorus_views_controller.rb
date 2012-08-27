class ChorusViewsController < ApplicationController
  def create
    param = params[:chorus_view]

    begin
      chorus_view = ChorusView.new
      chorus_view.name = param[:object_name]
      chorus_view.schema = GpdbSchema.find(param[:schema_id])
      chorus_view.query = param[:query]
      chorus_view.save!

      workspace = Workspace.find(param[:workspace_id])
      workspace.bound_datasets << chorus_view

      render :json => {}, :status => :created
    rescue ActiveRecord::StatementInvalid => e
      head 422
    end

  end
end
