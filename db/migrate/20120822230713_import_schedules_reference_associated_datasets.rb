class ImportSchedulesReferenceAssociatedDatasets < ActiveRecord::Migration
  def up
    remove_column :datasets, :import_schedule_id
    add_column :import_schedules, :associated_dataset_id, :integer
  end

  def down
    add_column :datasets, :import_schedule_id, :integer
    remove_column :import_schedules, :associated_dataset_id
  end
end
