module Events
  class Note < Base
    validates_presence_of :actor_id
    searchable do
      text :body, :stored => true
      string :grouping_id
      string :type_name
    end

    def self.create_for_entity(entity_type, entity_id, body, current_user)
      case entity_type
        when "greenplum_instance"
          instance = Instance.find(entity_id)
          Events::NOTE_ON_GREENPLUM_INSTANCE.by(current_user).add(:greenplum_instance => instance, :body => body)
        when "hadoop_instance"
          instance = HadoopInstance.find(entity_id)
          Events::NOTE_ON_HADOOP_INSTANCE.by(current_user).add(:hadoop_instance => instance, :body => body)
        when "hdfs"
          hadoop_instance_id, path = entity_id.split('|')
          hdfs_file_reference = HdfsFileReference.find_or_create_by_hadoop_instance_id_and_path(hadoop_instance_id, path)
          Events::NOTE_ON_HDFS_FILE.by(current_user).add(:hdfs_file => hdfs_file_reference, :body => body)
        when "workspace"
          workspace = Workspace.find(entity_id)
          Events::NOTE_ON_WORKSPACE.by(current_user).add(:workspace =>workspace, :body => body)
        else
          raise "Unknown entity type: #{entity_type}"
      end
    end

    def grouping_id
      (target1 && target1.grouping_id) || workspace.grouping_id
    end

    def type_name
      (target1 && target1.type_name) || workspace.type_name
    end
  end

  class NOTE_ON_GREENPLUM_INSTANCE < Note
    has_targets :greenplum_instance
    has_activities :actor, :greenplum_instance, :global
    has_additional_data :body
  end

  class NOTE_ON_HADOOP_INSTANCE < Note
    has_targets :hadoop_instance
    has_activities :actor, :hadoop_instance, :global
    has_additional_data :body
  end

  class NOTE_ON_HDFS_FILE < Note
    has_targets :hdfs_file
    has_activities :actor, :hdfs_file, :global
    has_additional_data :body
  end

  class NOTE_ON_WORKSPACE < Note
    has_targets :workspace
    has_activities :actor, :workspace, :global
    has_additional_data :body
  end
end
