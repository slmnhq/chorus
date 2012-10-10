module Events
  class NoteOnGnipInstance < Note
    has_targets :gnip_instance
    has_activities :actor, :gnip_instance, :global
  end
end