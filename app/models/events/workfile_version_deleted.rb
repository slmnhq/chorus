require 'events/base'

module Events
  class WorkfileVersionDeleted < Base
    has_targets :workfile, :workspace
    has_activities :actor, :workfile, :workspace, :global
    has_additional_data :version_num
  end
end