module Events
  class FileImportCreated < Base
    has_targets :workspace, :dataset
    has_activities :actor, :workspace, :dataset
    has_additional_data :file_name, :import_type, :destination_table
  end
end