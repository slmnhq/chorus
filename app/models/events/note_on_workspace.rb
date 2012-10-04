module Events
  class NoteOnWorkspace < Note
    has_targets :workspace
    has_activities :actor, :workspace

    validate :no_note_on_archived_workspace, :on => :create

    def no_note_on_archived_workspace
      errors.add(:workspace, :generic, {:message => "Can not add a note on an archived workspace"}) if workspace.archived?
    end

    include_shared_search_fields(:workspace)
  end
end