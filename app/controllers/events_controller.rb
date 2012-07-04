class EventsController < ApplicationController
  def index
    entity_type = params[:entity_type]

    case entity_type
      when "dashboard"
        events = Events::Base.for_dashboard_of(current_user)
      when "hdfs"
        hadoop_instance_id, path = params[:entity_id].split("|")
        hdfs_file = HdfsFileReference.find_by_hadoop_instance_id_and_path(hadoop_instance_id, path)
        events = hdfs_file && hdfs_file.events
      else
        begin
          klass = entity_type.classify.constantize
        rescue Exception => e
          head :not_found
        end
        object = klass.find(params[:entity_id])
        events = object && object.events
    end

    events ? present(events) : render(:json => {}, :status => :ok)
  end

  def show
    present Events::Base.find(params[:id])
  end
end
