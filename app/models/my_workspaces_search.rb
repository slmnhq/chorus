class MyWorkspacesSearch < Search
  def initialize(current_user, params = {})
    @models_to_search = [Workspace, Workfile, Dataset]
    super
  end

  def build_search
    super
    @search.build do
      with :workspace_id, current_user.memberships.map(&:workspace_id)
    end
  end
end
