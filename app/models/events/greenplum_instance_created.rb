module Events
  class GreenplumInstanceCreated < Base
    has_targets :greenplum_instance
    has_activities :actor, :greenplum_instance, :global
  end
end