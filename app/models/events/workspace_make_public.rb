require 'events/base'

module Events
  class WorkspaceMakePublic < Base
    has_targets :workspace
    has_activities :actor, :workspace, :global
  end
end