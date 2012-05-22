class WorkspaceAccess < DefaultAccess

  def view?(workspace)
    return false unless logged_in?
    workspace.public || workspace.members.include?(context)
  end

  def edit?(workspace)
    return false unless logged_in?
    workspace.members.include?(context)
  end
end