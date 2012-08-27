require 'events/base'

module Events
  class GreenplumInstanceChangedName < Base
    has_targets :greenplum_instance
    has_additional_data :old_name, :new_name
    has_activities :actor, :greenplum_instance, :global
  end
end