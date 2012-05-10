class HadoopInstancesController < ApplicationController
  def create
    cached_instance = Hdfs::InstanceRegistrar.create!(params[:instance], current_user)
    present cached_instance, :status => :created
  end
end
