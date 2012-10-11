class GnipInstancesController < ApplicationController

  def create
    instance = Gnip::InstanceRegistrar.create!(params[:gnip_instance], current_user)
    present instance, :status => :created
  end

  def index
    present GnipInstance.all
  end

  def show
    present GnipInstance.find(params[:id])
  end
end