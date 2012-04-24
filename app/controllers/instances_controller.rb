class InstancesController < ApplicationController
  def index
    present Instance.scoped
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
