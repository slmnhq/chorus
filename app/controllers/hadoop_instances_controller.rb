class HadoopInstancesController < ApplicationController
  def create
    cached_instance = Hdfs::InstanceRegistrar.create!(params[:hadoop_instance], current_user)
    present cached_instance, :status => :created
  end

  def index
    present HadoopInstance.scoped
  end
end
