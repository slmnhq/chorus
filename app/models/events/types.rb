require_relative "base"

module Events
  class GREENPLUM_INSTANCE_CREATED < Base
    has_targets :greenplum_instance
    has_activities :actor, :greenplum_instance, :global
  end

  class HADOOP_INSTANCE_CREATED < Base
    has_targets :hadoop_instance
    has_activities :actor, :hadoop_instance, :global
  end

  class GREENPLUM_INSTANCE_CHANGED_OWNER < Base
    has_targets :greenplum_instance, :new_owner
    has_activities :greenplum_instance, :new_owner, :global
  end

  class GREENPLUM_INSTANCE_CHANGED_NAME < Base
    has_targets :greenplum_instance
    has_additional_data :old_name, :new_name
    has_activities :actor, :greenplum_instance, :global
  end

  class HADOOP_INSTANCE_CHANGED_NAME < Base
    has_targets :hadoop_instance
    has_additional_data :old_name, :new_name
    has_activities :actor, :hadoop_instance, :global
  end

  class WORKFILE_CREATED < Base
    has_targets :workfile, :workspace
    has_activities :actor, :workfile, :workspace
  end

  class WORKSPACE_MAKE_PUBLIC < Base
    has_targets :workspace
    has_activities :actor, :workspace, :global
  end

  class WORKSPACE_MAKE_PRIVATE < Base
    has_targets :workspace
    has_activities :actor, :workspace
  end

  class WORKSPACE_ARCHIVED < Base
    has_targets :workspace
    has_activities :actor, :workspace, :global
  end

  class PUBLIC_WORKSPACE_CREATED < Base
    has_targets :workspace
    has_activities :actor, :workspace, :global
  end

  class PRIVATE_WORKSPACE_CREATED < Base
    has_targets :workspace
    has_activities :actor, :workspace
  end

  class SOURCE_TABLE_CREATED < Base
    has_targets :dataset, :workspace
    has_activities :actor, :dataset, :workspace, :global
  end

  class WORKSPACE_ADD_SANDBOX < Base
    has_targets :workspace
    has_activities :actor, :workspace, :global
  end

  class USER_ADDED < Base
    has_targets :new_user
    has_activities :actor, :new_user, :global
  end

  class WORKSPACE_ADD_HDFS_AS_EXT_TABLE < Base
    has_targets :dataset, :hdfs_file, :workspace
    has_activities :actor, :workspace, :dataset, :hdfs_file, :global
  end

  class IMPORT_SUCCESS < Base
    has_targets :workspace, :dataset
    has_activities :actor, :workspace, :dataset
    has_additional_data :file_name, :import_type
  end

  class IMPORT_FAILED < Base
    has_targets :workspace
    has_activities :actor, :workspace
    has_additional_data :file_name, :import_type, :destination_table, :error_message
  end

end
