class NoteCommentMigrator
  def migrate
    unless Legacy.connection.column_exists?(:edc_comment, :chorus_rails_event_id)
      Legacy.connection.add_column :edc_comment, :chorus_rails_event_id, :integer
    end

    get_all_comments do |comment_id, comment_type, comment_body, comment_timestamp, updated_timestamp, legacy_user|
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
        else
          next
      end

      event.created_at = comment_timestamp
      event.updated_at = updated_timestamp
      event.save!
      update_event_id(comment_id, event.id)
    end
  end

  private

  def get_all_comments
    sql = "SELECT chorus_rails_user_id, ec.id, entity_type, body, ec.created_stamp, ec.last_updated_stamp FROM edc_comment ec, edc_user eu where user_name = author_name"

    comment_table_data = Legacy.connection.exec_query(sql)
    comment_table_data.map do |comment_data|
      yield comment_data["id"], comment_data["entity_type"], comment_data["body"], comment_data["created_stamp"], comment_data["last_updated_stamp"], comment_data["chorus_rails_user_id"]
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
    sql = "SELECT ew.chorus_rails_workspace_id, ec.entity_id FROM edc_workspace ew, edc_comment ec
                                               WHERE ec.id = '#{comment_id}'
                                               AND ew.id = ec.entity_id"

    result = Legacy.connection.exec_query(sql)
    extract_result("chorus_rails_workspace_id", result)
  end

  def update_event_id(comment_id, event_id)
    Legacy.connection.update("UPDATE edc_comment SET chorus_rails_event_id = #{event_id} WHERE id = '#{comment_id}'")
  end

  def extract_result(result_key, sql)
    instance_data = Array(sql)[0]
    instance_data && instance_data[result_key]
  end
end
