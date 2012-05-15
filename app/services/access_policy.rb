class AccessPolicy
  def self.workspaces_for(user)
    if user.admin?
      Workspace.scoped
    else
      Workspace.accessible_to(user)
    end
  end
end
