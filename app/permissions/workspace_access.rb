class WorkspaceAccess < AdminFullAccess
  def self.members_for(user, workspace)
    if user.admin?
      workspace.members
    else
      workspace.members_accessible_to(user)
    end
  end

  def show?(workspace)
    workspace.public || workspace.member?(current_user)
  end

  def can_edit_sub_objects?(workspace)
    !workspace.archived? && workspace.member?(current_user)
  end

  def update?(workspace)
    return false unless workspace.member?(current_user)
    if workspace.sandbox_id_changed? && workspace.sandbox_id
      return false unless workspace.owner == current_user && context.can?(:show_contents, workspace.sandbox.instance)
    end
    workspace.owner == current_user || (workspace.changed - ['name', 'summary']).empty?
  end

  def owner?(workspace)
    workspace.owner == current_user
  end
end
