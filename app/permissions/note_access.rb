module Events
  class NoteAccess < DefaultAccess
    def update?(note)
      note.actor == current_user
    end

    def destroy?(note)
      note.actor == current_user || current_user.admin? || current_user_is_workspace_owner?(note)
    end

    private

    def current_user_is_workspace_owner?(note)
      note.is_a?(NOTE_ON_WORKSPACE) && (current_user == note.workspace.owner)
    end
  end

  # Right now, we need an access class for each subclass of Note
  Events::Note.subclasses.each do |subclass|
    model_class_name = subclass.name.demodulize
    Events.const_set("#{model_class_name}Access", NoteAccess)
  end
end
