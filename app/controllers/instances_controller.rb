class InstancesController < ApplicationController
  def index
    instances = if params[:accessible]
                  AccessPolicy.instances_for(current_user)
                else
                  Instance.scoped
                end

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
