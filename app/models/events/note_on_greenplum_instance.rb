require 'events/note'

module Events
  class NoteOnGreenplumInstance < Note
    has_targets :greenplum_instance
    has_activities :actor, :greenplum_instance, :global
  end
end