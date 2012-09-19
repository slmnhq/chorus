class ImportScheduler
  def self.run
    ImportSchedule.ready_to_run.each do |schedule|
      attributes = {
          :workspace_id => schedule.workspace_id,
          :to_table => schedule.to_table,
          :source_dataset_id => schedule.source_dataset_id,
          :truncate => schedule.truncate,
          :new_table => schedule.new_table,
          :user_id => schedule.user_id,
          :sample_count => schedule.sample_count,
          :dataset_import_created_event_id => schedule.dataset_import_created_event_id
      }

      Import.transaction do
        import = schedule.imports.create!(attributes, :without_protection => true)
        schedule.update_attributes!({:last_scheduled_at => Time.now}, :without_protection => true)
        QC.enqueue("Import.run", import.id)
      end
    end
  end
end