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
end
