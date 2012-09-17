require 'events/base'

module Events
  class DatasetChangedQuery < Base
    has_targets :dataset, :workspace
    has_activities :actor, :workspace, :dataset
  end
end