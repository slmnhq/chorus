require 'events/base'

module Events
  class ChorusViewCreated < Base
    has_targets :dataset, :source_object
    has_activities :actor, :workspace, :dataset, :source_object
  end
end