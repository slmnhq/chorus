class GnipInstancesController < ApplicationController
  def create
    parameters = params[:gnip_instance].merge({ :owner => current_user })
    GnipInstance.create!(parameters)

    render :json => {}, :status => :created
  end

  def index
    present GnipInstance.all
  end
end