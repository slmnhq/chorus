require 'events/base'

module Events
  class ChorusViewCreatedFromDataset < Base
    has_targets :dataset, :source_dataset
    has_activities :actor, :workspace, :dataset, :source_dataset
  end
end