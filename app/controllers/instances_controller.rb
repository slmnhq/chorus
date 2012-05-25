class InstancesController < ApplicationController
  def index
    instances = if params[:accessible]
                  AccessPolicy.instances_for(current_user)
                else
                  Instance.scoped
                end

    present instances
  end

  def show
    instance = Instance.find(params[:id])
    authorize! :show, instance
    present instance
  end

  def create
    cached_instance = Gpdb::InstanceRegistrar.create!(params[:instance], current_user)
    present cached_instance, :status => :created
  end

  def update
    instance = Instance.find(params[:id])
    authorize! :edit, instance
    cached_instance = Gpdb::InstanceRegistrar.update!(instance, params[:instance], current_user)
    present cached_instance
  end
end
