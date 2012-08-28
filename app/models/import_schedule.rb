class ImportSchedule < ActiveRecord::Base
  belongs_to :workspace
  belongs_to :source_dataset, :class_name => 'Dataset'
  belongs_to :user

  def self.run_pending_imports
    ImportSchedule.all.each do |import_schedule|
      QC.enqueue("Import.run", import_schedule.source_dataset_id, import_schedule.user_id, {
        "workspace_id" => import_schedule.workspace_id,
        "dataset_id" => import_schedule.source_dataset_id,
        "to_table" => import_schedule.to_table,
        "new_table" => import_schedule.new_table,
        "remote_copy" => import_schedule.workspace.sandbox.database != import_schedule.source_dataset.schema.database,
        "schedule_start_time" => import_schedule.start_datetime,
        "schedule_end_time" => import_schedule.end_date,
        "schedule_frequency"=> import_schedule.frequency,
        "row_limit" => import_schedule.row_limit,
        "import_type"=>"schedule"
      })
    end
  end

  def set_next_import
    val = ImportTime.new(
        start_datetime,
        end_date,
        frequency,
        Time.current
    ).next_import_time
    self.next_import_at = val
    save!
  end

end