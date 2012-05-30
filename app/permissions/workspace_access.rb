class WorkspaceAccess < DefaultAccess
  def show?(workspace)
    workspace.public || workspace.members.include?(current_user)
  end

  def member_edit?(workspace)
    workspace.members.include?(current_user)
  end

  def administrative_edit?(workspace)
    workspace.owner == current_user
  end
end
