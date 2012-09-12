require 'events/base'

module Events
  class ChorusViewCreatedFromWorkfile < Base
    has_targets :dataset, :workfile
    has_activities :actor, :workspace, :dataset
  end
end