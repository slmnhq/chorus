class GnipInstancesController < ApplicationController
  def create
    current_user.gnip_instances.create!(params[:gnip_instance])
    render :json => {}, :status => :created
  end

  def index
    present GnipInstance.all
  end

  def show
    present GnipInstance.find(params[:id])
  end
end