class InstancesController < ApplicationController
  def index
    present Instance.for_user(current_user)
  end

  def create
    cached_instance = Gpdb::ConnectionBuilder.create!(params[:instance], current_user)
    present cached_instance, :status => :created
  end

  def update
    cached_instance = Gpdb::ConnectionBuilder.update!(params[:id], params[:instance], current_user)
    present cached_instance
  end
end
