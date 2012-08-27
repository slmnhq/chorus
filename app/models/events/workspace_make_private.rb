require 'events/base'

module Events
  class WorkspaceMakePrivate < Base
    has_targets :workspace
    has_activities :actor, :workspace
  end
end