module Events
  class GreenplumInstanceChangedOwner < Base
    has_targets :greenplum_instance, :new_owner
    has_activities :greenplum_instance, :new_owner, :global
  end
end