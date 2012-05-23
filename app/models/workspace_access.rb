class WorkspaceAccess < DefaultAccess

  def show?(workspace)
    return false unless logged_in?
    workspace.public || workspace.members.include?(context)
  end

  def index?
    logged_in?
  end

  def edit?(workspace)
    return false unless logged_in?
    workspace.members.include?(context)
  end
end
