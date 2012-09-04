require 'events/base'

module Events
  class DatasetImportSuccess < Base
    has_targets :workspace, :dataset
    has_activities :actor, :workspace, :dataset, :source_dataset
    has_additional_data :source_dataset_id
    translate_additional_data_ids :source_dataset => Dataset
  end
end