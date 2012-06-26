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

  class SOURCE_TABLE_CREATED < Base
    has_targets :dataset, :workspace
    has_activities :actor, :dataset, :workspace, :global
  end

  class WORKSPACE_ADD_SANDBOX < Base
    has_targets :sandbox_schema, :workspace
    has_activities :actor, :sandbox_schema, :workspace, :global
  end
end
