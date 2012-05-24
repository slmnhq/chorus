class Hdfs::FilesController < ApplicationController
  def index
    present HdfsEntry.list("/", hadoop_instance)
  end

  def show
    present HdfsEntry.list("/" + params[:id] + '/', hadoop_instance)
  end

  private

  def hadoop_instance
    @hadoop_instance ||= HadoopInstance.find(params[:hadoop_instance_id])
  end
end