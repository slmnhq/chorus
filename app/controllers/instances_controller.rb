class InstancesController < ApplicationController
  def index
    instances = Instance.scoped
    instances = instances.accessible_to(current_user) if params[:accessible]

    present instances
  end

  def create
    cached_instance = Gpdb::InstanceRegistrar.create!(params[:instance], current_user)
    present cached_instance, :status => :created
  end

  def update
    cached_instance = Gpdb::InstanceRegistrar.update!(params[:id], params[:instance], current_user)
    present cached_instance
  end
end
