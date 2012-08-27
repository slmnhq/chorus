require 'events/base'

module Events
  class FileImportSuccess < Base
    has_targets :workspace, :dataset
    has_activities :actor, :workspace, :dataset
    has_additional_data :file_name, :import_type
  end
end