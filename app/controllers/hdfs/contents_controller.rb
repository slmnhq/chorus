class Hdfs::ContentsController < ApplicationController
  def show
    hadoop_instance = HadoopInstance.find(params[:hadoop_instance_id])
    present HdfsEntry.list(params[:id], hadoop_instance).first.file
  end
end