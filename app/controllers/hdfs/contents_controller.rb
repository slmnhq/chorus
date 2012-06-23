class Hdfs::ContentsController < ApplicationController
  def show
    hadoop_instance = HadoopInstance.find(params[:hadoop_instance_id])
    present HdfsFile.new(params[:id], hadoop_instance)
  end
end