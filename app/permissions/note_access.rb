module Events
  class NoteAccess < AdminFullAccess
    def update?(note)
      note.actor == current_user
    end

    def destroy?(note)
      note.actor == current_user || current_user.admin? || current_user_is_workspace_owner?(note)
    end

    def create?(klass, entity_type, entity_id)
      model = ModelMap.model_from_params(entity_type, entity_id)
      access_for(model).can? :create_note_on, model
    end

    private

    def current_user_is_workspace_owner?(note)
      note.is_a?(NoteOnWorkspace) && (current_user == note.workspace.owner)
    end
  end
end
