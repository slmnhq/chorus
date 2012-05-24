class Hdfs::ContentsController < ApplicationController
  def show
    hadoop_instance = HadoopInstance.find(params[:hadoop_instance_id])
    hdfs_query = Hdfs::QueryService.new(hadoop_instance)

    render :text => build_json(hdfs_query.show('/' + params[:id]))
  end

  private
  def build_json(content)
    { :content => content }.to_json
  end
end