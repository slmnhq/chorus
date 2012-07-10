module Events
  class Note < Base
    searchable do
      text :body, :stored => true
      string :grouping_id
      string :type_name
    end

    def grouping_id
      target1.grouping_id
    end

    def type_name
      target1.type_name
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
end