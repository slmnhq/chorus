class Legacy::ActivityStream
  attr_reader :id, :type, :created_stamp, :indirect_verb

  def self.all
    sql = "SELECT id, type, created_stamp, indirect_verb FROM edc_activity_stream"

    activity_stream_data = Legacy.connection.exec_query(sql)
    activity_stream_data.map do |activity_data|
      new(activity_data["id"], activity_data["type"], activity_data["created_stamp"], activity_data["indirect_verb"])
    end
  end

  def initialize(id, type, created_stamp, indirect_verb=nil)
    @id = id
    @type = type
    @created_stamp = created_stamp
    @indirect_verb = indirect_verb if indirect_verb
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

  def rails_object_user_id
    sql = "SELECT eu.chorus_rails_user_id FROM edc_user eu, edc_activity_stream_object aso
                                           WHERE aso.activity_stream_id = '#{id}'
                                           AND aso.object_type = 'object'
                                           AND aso.entity_type = 'user'
                                           AND eu.id = aso.object_id"
    extract_result("chorus_rails_user_id", Legacy.connection.exec_query(sql))
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

  def author_id
    sql = "SELECT eu.chorus_rails_user_id FROM edc_user eu, edc_activity_stream ats
                                           WHERE ats.id = '#{id}'
                                           AND eu.user_name = ats.author"

    extract_result("chorus_rails_user_id", Legacy.connection.exec_query(sql))
  end

  def hadoop_instance_id
    sql = "SELECT aso.object_id FROM edc_activity_stream_object aso
                                         WHERE aso.activity_stream_id = '#{id}'
                                         AND aso.object_type = 'actor'"

    object_id = extract_result("object_id", Legacy.connection.exec_query(sql))
    ids = object_id.delete("\"").split("|")
    legacy_hadoop_instance_id = ids[0]
    path_name = ids[1]
    sql = "SELECT ei.chorus_rails_instance_id FROM edc_instance ei WHERE ei.id = '#{legacy_hadoop_instance_id}'"
    rails_hadoop_instance_id = extract_result("chorus_rails_instance_id", Legacy.connection.exec_query(sql))
    hadoop_instance = HadoopInstance.find_by_id(rails_hadoop_instance_id)
    return hadoop_instance[:id] , path_name
  end

  def rails_dataset_id
    sql = "SELECT aso.object_id FROM edc_activity_stream_object aso
                                     WHERE aso.activity_stream_id = '#{id}'
                                     AND aso.object_type = 'object' AND entity_type IN ('table', 'chorusView', 'databaseOBject', 'sourceObject', 'view', 'databaseObject')"

    object_id = extract_result("object_id", Legacy.connection.exec_query(sql))
    ids = object_id.delete("\"").split("|")
    legacy_instance_id = ids[0]
    database_name = ids[1]
    schema_name = ids[2]
    dataset_name = ids[4]

    sql = "SELECT ei.chorus_rails_instance_id FROM edc_instance ei WHERE ei.id = '#{legacy_instance_id}'"
    rails_instance_id = extract_result("chorus_rails_instance_id", Legacy.connection.exec_query(sql))
    instance = Instance.find_by_id(rails_instance_id)
    raise Exception, "Instance for activity could not be found" unless instance

    database = instance.databases.find_or_create_by_name(database_name)
    schema = database.schemas.find_or_create_by_name(schema_name)
    dataset = schema.datasets.find_or_create_by_name(dataset_name)
    dataset.id
  end

  def rails_dataset_id_for_import_source
    sql = "SELECT aso.object_id FROM edc_activity_stream_object aso
                                     WHERE aso.activity_stream_id = '#{id}'
                                     AND aso.object_type = 'object' AND entity_type IN ('chorusView', 'databaseObject')"

    object_id = extract_result("object_id", Legacy.connection.exec_query(sql))
    ids = object_id.delete("\"").split("|")
    legacy_instance_id = ids[0]
    database_name = ids[1]
    schema_name = ids[2]
    dataset_name = ids[4]

    sql = "SELECT ei.chorus_rails_instance_id FROM edc_instance ei WHERE ei.id = '#{legacy_instance_id}'"
    rails_instance_id = extract_result("chorus_rails_instance_id", Legacy.connection.exec_query(sql))
    instance = Instance.find_by_id(rails_instance_id)
    raise Exception, "Instance for activity could not be found" unless instance

    database = instance.databases.find_or_create_by_name(database_name)
    schema = database.schemas.find_or_create_by_name(schema_name)
    dataset = schema.datasets.find_or_create_by_name(dataset_name)
    dataset.id
  end

  def rails_dataset_id_for_import_destination
    sql = "SELECT aso.object_id FROM edc_activity_stream_object aso
                                     WHERE aso.activity_stream_id = '#{id}'
                                     AND aso.object_type = 'object' AND entity_type IN ('table')"
    object_id = extract_result("object_id", Legacy.connection.exec_query(sql))
    ids = object_id.delete("\"").split("|")
    legacy_instance_id = ids[0]
    database_name = ids[1]
    schema_name = ids[2]
    dataset_name = ids[4]

    sql = "SELECT ei.chorus_rails_instance_id FROM edc_instance ei WHERE ei.id = '#{legacy_instance_id}'"
    rails_instance_id = extract_result("chorus_rails_instance_id", Legacy.connection.exec_query(sql))
    instance = Instance.find_by_id(rails_instance_id)
    raise Exception, "Instance for activity could not be found" unless instance
    database = instance.databases.find_or_create_by_name(database_name)
    schema = database.schemas.find_or_create_by_name(schema_name)
    dataset = schema.datasets.find_or_create_by_name(dataset_name)
    dataset.id
  end

  def rails_member_id_and_count
    sql = "SELECT eu.chorus_rails_user_id FROM edc_user eu LEFT OUTER JOIN edc_activity_stream_object aso on eu.id = aso.object_id
                                     WHERE aso.activity_stream_id = '#{id}'
                                     AND aso.object_type = 'object' AND entity_type = 'user'"
    results = Array(Legacy.connection.exec_query(sql))
    user_id = results.first ? results.first["chorus_rails_user_id"] : nil
    num_members = results.size

    return user_id, num_members
  end

  def file_name
    sql = "SELECT aso.object_name FROM edc_activity_stream_object aso
                                     WHERE aso.activity_stream_id = '#{id}'
                                     AND aso.object_type = 'object' AND entity_type = 'file'"

    extract_result("object_name", Legacy.connection.exec_query(sql))
  end

  def destination_table
    sql = "SELECT aso.object_name FROM edc_activity_stream_object aso
                                     WHERE aso.activity_stream_id = '#{id}'
                                     AND aso.object_type = 'object' AND entity_type = 'table'"
    extract_result("object_name", Legacy.connection.exec_query(sql))
  end

  def import_error_message
    sql = "SELECT et.result FROM edc_task et, edc_activity_stream_object aso
                              WHERE aso.activity_stream_id = '#{id}'
                              AND aso.object_type = 'object' AND entity_type = 'task'
                              AND aso.object_id = et.id"
    extract_result("result", Legacy.connection.exec_query(sql))
  end

  private

  def extract_result(result_key, sql)
    instance_data = Array(sql)[0]
    instance_data && instance_data[result_key]
  end
end
