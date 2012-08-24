class ChorusViewsController < ApplicationController
  def create
    param = params[:chorus_view]

    chorus_view = ChorusView.new
    chorus_view.name = param[:name]
    chorus_view.schema = GpdbSchema.find(param[:schema])
    chorus_view.query = param[:query]
    chorus_view.save!

    render :json => {}, :status => :created
  end
end
