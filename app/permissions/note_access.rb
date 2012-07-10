module Events
  class NoteAccess < DefaultAccess
    def update?(note)
      note.actor == current_user
    end
  end

  class NOTE_ON_GREENPLUM_INSTANCEAccess < NoteAccess
  end
end
