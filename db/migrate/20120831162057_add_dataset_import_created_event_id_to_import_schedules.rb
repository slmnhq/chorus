class AddDatasetImportCreatedEventIdToImportSchedules < ActiveRecord::Migration
  def change
    add_column :import_schedules, :dataset_import_created_event_id, :integer
  end
end
