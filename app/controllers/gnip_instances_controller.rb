class GnipInstancesController < ApplicationController

  def create
    Gnip::InstanceRegistrar.create!(params[:gnip_instance], current_user)
    render :json => {}, :status => :created
  end

  def index
    present GnipInstance.all
  end

  def show
    present GnipInstance.find(params[:id])
  end
end