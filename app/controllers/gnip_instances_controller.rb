class GnipInstancesController < ApplicationController

  def create
    instance = Gnip::InstanceRegistrar.create!(params[:gnip_instance], current_user)
    present instance, :status => :created
  end

  def index
    present paginate GnipInstance.all
  end

  def show
    present GnipInstance.find(params[:id])
  end

  def update
    gnip_params = params[:gnip_instance]
    instance = Gnip::InstanceRegistrar.update!(params[:id], gnip_params)

    present instance
  end
end