class NotesController < ApplicationController
  def create
    body = params[:note][:body]

    case params[:note][:entity_type]
      when "instance"
        instance = Instance.find(params[:note][:entity_id])
        Events::NOTE_ON_GREENPLUM_INSTANCE.by(current_user).add(:greenplum_instance => instance, :body => body)
      when "hdfs"
        hadoop_instance_id, path = params[:note][:entity_id].split('|')

        hdfs_file_reference = HdfsFileReference.find_or_create_by_hadoop_instance_id_and_path(hadoop_instance_id, path)
        Events::NOTE_ON_HDFS_FILE.by(current_user).add(:hdfs_file => hdfs_file_reference, :body => body)
    end

    render :json => {}, :status => :created
  end
end