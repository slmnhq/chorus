require 'events/base'

module Events
  class ViewCreated < Base

    has_targets :dataset, :source_dataset, :workspace
    has_activities :actor, :workspace, :dataset, :source_dataset
  end
end