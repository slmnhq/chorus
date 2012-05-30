class WorkspaceAccess < DefaultAccess
  def show?(workspace)
    current_user.admin? || workspace.public || workspace.members.include?(current_user)
  end

  def member_edit?(workspace)
    current_user.admin? || workspace.members.include?(current_user)
  end

  def administrative_edit?(workspace)
    current_user.admin? || workspace.owner == current_user
  end
end
