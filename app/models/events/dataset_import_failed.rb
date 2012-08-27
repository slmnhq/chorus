require 'events/base'

module Events
  class DatasetImportFailed < Base
    has_targets :workspace
    has_activities :actor, :workspace
    has_additional_data :source_dataset_id, :destination_table, :error_message
    translate_additional_data_ids :source_dataset => Dataset
  end
end