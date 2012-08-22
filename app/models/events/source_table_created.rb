module Events
  class SourceTableCreated < Base
    has_targets :dataset, :workspace
    has_activities :actor, :dataset, :workspace, :global
  end
end