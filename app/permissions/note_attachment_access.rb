class NoteAttachmentAccess < AdminFullAccess

  def create?(event)
    current_user == event.actor
  end

end
