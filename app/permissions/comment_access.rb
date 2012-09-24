class CommentAccess < AdminFullAccess
  def show?(comment)
    Events::Base.for_dashboard_of(current_user).find(comment.event_id)
    true
  rescue ActiveRecord::RecordNotFound => e
    false
  end

  def create_comment_on?(comment, event)
    Events::Base.for_dashboard_of(current_user).find(event.id)
    true
  rescue ActiveRecord::RecordNotFound => e
    return true if event.workspace.public?
    false
  end

  def destroy?(comment)
    comment.author == current_user
  end
end