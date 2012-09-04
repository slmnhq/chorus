require 'events/base'

module Events
  class DatasetImportFailed < Base
    has_targets :workspace, :source_dataset
    has_activities :actor, :workspace, :source_dataset
    has_additional_data :destination_table, :error_message
  end
end
