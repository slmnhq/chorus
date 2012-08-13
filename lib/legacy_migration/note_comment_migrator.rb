class NoteCommentMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_comment, :chorus_rails_event_id)
      Legacy.connection.add_column :edc_comment, :chorus_rails_event_id, :integer
    end

    get_all_comments do |comment_id, comment_type, comment_body, comment_timestamp, updated_timestamp, is_deleted, legacy_user, comment_workspace_id, entity_id|
      actor = User.find_with_destroyed(legacy_user)
      case comment_type
        when 'instance'
          instance_id, instance_provider = instance_id_and_provider(comment_id)
          if instance_provider == 'Greenplum Database'
            greenplum_instance = Instance.find(instance_id)
            event = Events::NOTE_ON_GREENPLUM_INSTANCE.create(:greenplum_instance => greenplum_instance, :body => comment_body, :actor => actor)
          elsif instance_provider == 'Hadoop'
            hadoop_instance = HadoopInstance.find(instance_id)
            event = Events::NOTE_ON_HADOOP_INSTANCE.create(:hadoop_instance => hadoop_instance, :body => comment_body, :actor => actor)
          else
            Raise "Unknown Instance Provider: #{instance_provider}"
          end
        when 'hdfs'
          hadoop_id, path = comment_id.split('|')
          hdfs_file = HdfsFileReference.create(:hadoop_instance_id => hadoop_id, :path => path)
          event = Events::NOTE_ON_HDFS_FILE.create(:hdfs_file => hdfs_file, :body => comment_body, :actor => actor)
        when 'workspace'
          workspace = Workspace.find_with_destroyed(workspace_id(comment_id))
          event = Events::NOTE_ON_WORKSPACE.create(:workspace => workspace, :body => comment_body, :actor => actor)
        when 'workfile'
          workspace = Workspace.find_with_destroyed(comment_workspace_id(comment_id))
          workfile = Workfile.find_with_destroyed(workfile_id(comment_id))
          event = Events::NOTE_ON_WORKFILE.create(:workspace => workspace, :workfile => workfile, :body => comment_body, :actor => actor)
        when 'databaseObject'
          if comment_workspace_id
            workspace = Workspace.find_with_destroyed(find_rails_workspace_id(comment_workspace_id))
            dataset = Dataset.find(rails_dataset_id(entity_id))
            event = Events::NOTE_ON_WORKSPACE_DATASET.create(:workspace => workspace, :body => comment_body, :actor => actor, :dataset => dataset)
          else
            dataset = Dataset.find(rails_dataset_id(entity_id))
            event = Events::NOTE_ON_DATASET.create(:workspace => workspace, :body => comment_body, :actor => actor, :dataset => dataset)
          end
        else
          next
      end

      event.created_at = comment_timestamp
      event.updated_at = updated_timestamp
      event.deleted_at = updated_timestamp if is_deleted == 't'
      event.save!
      update_event_id(comment_id, event.id)
    end
  end

  private

  def get_all_comments
    sql = "SELECT chorus_rails_user_id, ec.id, ec.workspace_id, ec.entity_id, entity_type, body, ec.created_stamp, ec.last_updated_stamp, ec.is_deleted FROM edc_comment ec, edc_user eu where user_name = author_name"

    comment_table_data = Legacy.connection.exec_query(sql)
    comment_table_data.map do |comment_data|
      yield comment_data["id"], comment_data["entity_type"], comment_data["body"], comment_data["created_stamp"], comment_data["last_updated_stamp"], comment_data["is_deleted"], comment_data["chorus_rails_user_id"], comment_data["workspace_id"], comment_data["entity_id"]
    end
  end

  def instance_id_and_provider(comment_id)
    sql = "SELECT ei.chorus_rails_instance_id, ei.instance_provider  FROM edc_instance ei, edc_comment ec
                                               WHERE ec.id = '#{comment_id}'
                                               AND ei.id = ec.entity_id"

    result = Legacy.connection.exec_query(sql)
    instance_id = extract_result("chorus_rails_instance_id", result)
    instance_provider = extract_result("instance_provider", result)
    return instance_id, instance_provider
  end

  def workspace_id(comment_id)
    sql = "SELECT ew.chorus_rails_workspace_id FROM edc_workspace ew, edc_comment ec
                                               WHERE ec.id = '#{comment_id}'
                                               AND ew.id = ec.entity_id"

    result = Legacy.connection.exec_query(sql)

    extract_result("chorus_rails_workspace_id", result)
  end

  def find_rails_workspace_id(comment_id)
    sql = "SELECT chorus_rails_workspace_id FROM edc_workspace ew
                                               WHERE ew.id = '#{comment_id}'"
    result = Legacy.connection.exec_query(sql)
    extract_result("chorus_rails_workspace_id", result)
  end

  #def dataset_id(dataset_id, workspace_id)
  #  sql = "SELECT chorus_rails_dataset_id FROM edc_dataset ew
  #                                             WHERE ew.composite_id = '#{dataset_id}'
  #                                              AND workspace_id = #{workspace_id}"
  #
  #  result = Legacy.connection.exec_query(sql)
  #
  #  extract_result("chorus_rails_dataset_id", result)
  #end

  def comment_workspace_id(comment_id)
    sql = "SELECT ew.chorus_rails_workspace_id FROM edc_workspace ew, edc_comment ec
                                               WHERE ec.id = '#{comment_id}'
                                               AND ew.id = ec.workspace_id"

    result = Legacy.connection.exec_query(sql)

    extract_result("chorus_rails_workspace_id", result)
  end

  def workfile_id(comment_id)
    sql = "SELECT ewf.chorus_rails_workfile_id FROM edc_work_file ewf, edc_comment ec
                                               WHERE ec.id = '#{comment_id}'
                                               AND ewf.id = ec.entity_id"

    result = Legacy.connection.exec_query(sql)
    extract_result("chorus_rails_workfile_id", result)
  end

  def update_event_id(comment_id, event_id)
    Legacy.connection.update("UPDATE edc_comment SET chorus_rails_event_id = #{event_id} WHERE id = '#{comment_id}'")
  end

  def extract_result(result_key, sql)
    instance_data = Array(sql)[0]
    instance_data && instance_data[result_key]
  end

  def rails_dataset_id(old_dataset_id)

    ids = old_dataset_id.delete("\"").split("|")
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
end
