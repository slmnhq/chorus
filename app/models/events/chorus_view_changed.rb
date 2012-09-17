require 'events/base'

module Events
  class ChorusViewChanged < Base
    has_targets :dataset, :workspace
    has_activities :actor, :workspace, :dataset
  end
end