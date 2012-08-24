class ChorusViewsController < ApplicationController
  def create
    param = params[:chorus_view]

    begin
      chorus_view = ChorusView.new
      chorus_view.name = param[:name]
      chorus_view.schema = GpdbSchema.find(param[:schema])
      chorus_view.query = param[:query]
      chorus_view.save!

      render :json => {}, :status => :created
    rescue ActiveRecord::StatementInvalid => e
      head 422
    end

  end
end
