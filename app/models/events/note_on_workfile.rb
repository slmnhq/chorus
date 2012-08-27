require 'events/note'

module Events
  class NoteOnWorkfile < Note
    has_targets :workfile
    has_activities :actor, :workfile, :workspace

    include_shared_search_fields(:workspace)
  end
end