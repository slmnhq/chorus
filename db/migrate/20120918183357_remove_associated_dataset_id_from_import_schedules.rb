class RemoveAssociatedDatasetIdFromImportSchedules < ActiveRecord::Migration
  def up
    remove_column :import_schedules, :associated_dataset_id
  end

  def down
    add_column :import_schedules, :associated_dataset_id, :integer
  end
end
