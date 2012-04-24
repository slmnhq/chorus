class InstancesController < ApplicationController
  def index
    present Instance.scoped
  end

  def create
    cached_instance = Gpdb::Instance.create_cache!(params[:instance], current_user)
    present cached_instance, :status => :created
  end

  def update
    cached_instance = Instance.find(params[:id])
    head(:unauthorized) and return unless current_user.admin? || current_user == cached_instance.owner
    cached_instance.attributes = params[:instance]
    cached_instance.save!
    present cached_instance
  end
end
