class AccessPolicy
  class << self
    def workspaces_for(user)
      resources_for(user, Workspace)
    end

    def instances_for(user)
      resources_for(user, Instance)
    end

    def workspace_members_for(user, workspace)
      if user.admin?
        workspace.members
      else
        workspace.members_accessible_to(user)
      end
    end

    private
    def resources_for(user, resources)
      if user.admin?
        resources.scoped
      else
        resources.accessible_to(user)
      end
    end
  end
end
