module Events
  class WorkspaceUnarchived < Base
    has_targets :workspace
    has_activities :actor, :workspace, :global
  end
end