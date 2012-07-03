class NotesController < ApplicationController
  def create
    body = params[:note][:body]

    case params[:note][:entity_type]
      when "instance"
        instance = Instance.find(params[:note][:entity_id])
        Events::NOTE_ON_GREENPLUM_INSTANCE.by(current_user).add(:greenplum_instance => instance, :body => body)
      when "hdfs"
        entity_id = params[:note][:entity_id].split('|')
        hdfs_file_reference = HdfsFileReference.create!({'path' => entity_id.last,
                                                         'hadoop_instance_id' => entity_id.first})
        Events::NOTE_ON_HDFS_FILE.by(current_user).add(:hdfs_file => hdfs_file_reference, :body => body)
    end

    render :json => {}, :status => :created
  end
end