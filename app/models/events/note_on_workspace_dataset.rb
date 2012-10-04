module Events
  class NoteOnWorkspaceDataset < Note
    has_targets :dataset, :workspace
    has_activities :actor, :dataset, :workspace

    include_shared_search_fields(:dataset)
  end
end