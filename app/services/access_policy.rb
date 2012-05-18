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

    def databases_for(user)
      if user.admin?
        GpdbDatabase.scoped
      else
        GpdbDatabase.where(:instance_id => instances_for(user).pluck(:id))
      end
    end

    def schemas_for(user)
      if user.admin?
        GpdbSchema.scoped
      else
        GpdbSchema.where(:database_id => databases_for(user).pluck(:id))
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
