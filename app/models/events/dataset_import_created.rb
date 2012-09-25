require 'events/base'

module Events
  class DatasetImportCreated < Base
    has_targets :source_dataset, :dataset, :workspace
    has_activities :actor, :workspace, :dataset, :source_dataset
    has_additional_data :destination_table
  end
end