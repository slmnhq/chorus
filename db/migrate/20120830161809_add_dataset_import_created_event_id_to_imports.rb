class AddDatasetImportCreatedEventIdToImports < ActiveRecord::Migration
  def change
    add_column :imports, :dataset_import_created_event_id, :integer
  end
end
