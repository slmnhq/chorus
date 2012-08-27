require 'events/base'

module Events
  class FileImportFailed < Base
    has_targets :workspace
    has_activities :actor, :workspace
    has_additional_data :file_name, :import_type, :destination_table, :error_message
  end
end