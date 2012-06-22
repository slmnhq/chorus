class Legacy::ActivityStream
  attr_reader :id, :type

  def self.all
    sql = "SELECT id, type FROM edc_activity_stream"

    activity_stream_data = Legacy.connection.exec_query(sql)
    activity_stream_data.map do |activity_data|
      new(activity_data["id"], activity_data["type"])
    end
  end

  def initialize(id, type)
    @id = id
    @type = type
  end

  def instance_greenplum?
    rails_greenplum_instance_id.present?
  end

  def instance_hadoop?
    rails_hadoop_instance_id.present?
  end

  def update_event_id(event_id)
    Legacy.connection.update("UPDATE edc_activity_stream SET chorus_rails_event_id = #{event_id} WHERE id = '#{id}'")
  end

  def rails_greenplum_instance_id
    sql = "SELECT ei.chorus_rails_instance_id  FROM edc_instance ei, edc_activity_stream_object aso
                                               WHERE aso.activity_stream_id = '#{id}'
                                               AND aso.object_type = 'object'
                                               AND aso.entity_type = 'instance'
                                               AND ei.id = aso.object_id
                                               AND ei.instance_provider = 'Greenplum Database'"

    extract_result("chorus_rails_instance_id", Legacy.connection.exec_query(sql))
  end

  def rails_hadoop_instance_id
    sql = "SELECT ei.chorus_rails_instance_id  FROM edc_instance ei, edc_activity_stream_object aso
                                               WHERE aso.activity_stream_id = '#{id}'
                                               AND aso.object_type = 'object'
                                               AND aso.entity_type = 'instance'
                                               AND ei.id = aso.object_id
                                               AND ei.instance_provider = 'Hadoop'"

    extract_result("chorus_rails_instance_id", Legacy.connection.exec_query(sql))
  end

  def rails_workfile_id
    sql = "SELECT ewf.chorus_rails_workfile_id FROM edc_work_file ewf, edc_activity_stream_object aso
                                               WHERE aso.activity_stream_id = '#{id}'
                                               AND aso.object_type = 'object'
                                               AND aso.entity_type = 'workfile'
                                               AND ewf.id = aso.object_id"

    extract_result("chorus_rails_workfile_id", Legacy.connection.exec_query(sql))
  end

  def chorus_rails_workspace_id
    sql = "SELECT ew.chorus_rails_workspace_id FROM edc_workspace ew, edc_activity_stream eas
                                           WHERE eas.workspace_id = ew.id
                                           AND eas.id = '#{id}'"

    extract_result("chorus_rails_workspace_id", Legacy.connection.exec_query(sql))
  end

  def user_id
    sql = "SELECT eu.chorus_rails_user_id FROM edc_user eu, edc_activity_stream_object aso
                                           WHERE aso.activity_stream_id = '#{id}'
                                           AND aso.object_type = 'actor'
                                           AND eu.id = aso.object_id"

    extract_result("chorus_rails_user_id", Legacy.connection.exec_query(sql))
  end

  def extract_result(result_key, sql)
    instance_data = Array(sql)[0]
    instance_data && instance_data[result_key]
  end
end
