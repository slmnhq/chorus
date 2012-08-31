class ImportScheduler
  def self.run
    ImportSchedule.where('next_import_at < ?', Time.current).each do |schedule|
      attributes = {
          :import_schedule_id => schedule.id,
          :workspace_id => schedule.workspace_id,
          :to_table => schedule.to_table,
          :source_dataset_id => schedule.source_dataset_id,
          :truncate => schedule.truncate,
          :new_table => schedule.new_table,
          :user_id => schedule.user_id,
          :sample_count => schedule.sample_count,
          :dataset_import_created_event_id => schedule.dataset_import_created_event_id
      }

      import = Import.create!(attributes, :without_protection => true)
      QC.enqueue("Import.run", import.id)
      schedule.last_scheduled_at = Time.now
      schedule.set_next_import
      schedule.save!
    end
  end
end