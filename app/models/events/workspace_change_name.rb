require 'events/base'

module Events
  class WorkspaceChangeName < Base
    has_targets :workspace
    has_activities :actor, :workspace
    has_additional_data :workspace_old_name
  end
end