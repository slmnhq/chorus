class AttachmentAccess < DefaultAccess
  def create?(klass, event)
    current_user == event.actor
  end
end
