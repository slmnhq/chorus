class HadoopInstancesController < ApplicationController
  def create
    cached_instance = Hdfs::InstanceRegistrar.create!(params[:hadoop_instance], current_user)
    present cached_instance, :status => :created
  end

  def index
    present HadoopInstance.scoped
  end

  def show
    present HadoopInstance.find(params[:id])
  end

  def update
    hadoop_instance = HadoopInstance.find(params[:id])
    authorize! :update, hadoop_instance

    hadoop_instance = Hdfs::InstanceRegistrar.update!(hadoop_instance.id, params[:hadoop_instance], current_user)
    present hadoop_instance
  end
end
