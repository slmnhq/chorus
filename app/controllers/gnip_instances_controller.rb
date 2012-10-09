class GnipInstancesController < ApplicationController
  def create
    parameters = params[:gnip_instance].merge({ :owner_id => current_user.id })
    GnipInstance.create!(parameters)

    render :json => {}, :status => :created
  end
end