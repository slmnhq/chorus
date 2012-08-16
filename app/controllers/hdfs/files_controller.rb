class Hdfs::FilesController < ApplicationController
  def index
    #hadoop_instance.refresh
    #present hadoop_instance.hdfs_entries.find_by_path('/').list
    present HdfsEntry.list("/", hadoop_instance)
  end

  def show
    #present hadoop_instance.hdfs_entries.find_by_path(params[:id].chomp('/')).list
    present HdfsEntry.list(params[:id].chomp('/') + '/', hadoop_instance)
  end

  private

  def hadoop_instance
    @hadoop_instance ||= HadoopInstance.find(params[:hadoop_instance_id])
  end
end
