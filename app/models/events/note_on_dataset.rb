module Events
  class NoteOnDataset < Note
    has_targets :dataset
    has_activities :actor, :dataset, :global

    include_shared_search_fields(:dataset)
  end
end