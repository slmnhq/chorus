require File.join(File.dirname(__FILE__), "base")

module Events
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

  class FILE_IMPORT_SUCCESS < Base
    has_targets :workspace, :dataset
    has_activities :actor, :workspace, :dataset
    has_additional_data :file_name, :import_type
  end

  class FILE_IMPORT_FAILED < Base
    has_targets :workspace
    has_activities :actor, :workspace
    has_additional_data :file_name, :import_type, :destination_table, :error_message
  end

  class DATASET_IMPORT_SUCCESS < Base
    has_targets :workspace, :dataset
    has_activities :actor, :workspace, :dataset
    has_additional_data :source_dataset_id
    translate_additional_data_ids :source_dataset => Dataset
  end

  class DATASET_IMPORT_FAILED < Base
    has_targets :workspace
    has_activities :actor, :workspace
    has_additional_data :source_dataset_id, :destination_table, :error_message
    translate_additional_data_ids :source_dataset => Dataset
  end

  class MEMBERS_ADDED < Base
    has_targets :member, :workspace
    has_activities :actor, :workspace
    has_additional_data :num_added
  end
end
