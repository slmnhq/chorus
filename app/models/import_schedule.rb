class ImportSchedule < ActiveRecord::Base
  belongs_to :workspace
  belongs_to :source_dataset, :class_name => 'Dataset'
  belongs_to :user

  def target_dataset_id
    if dataset_import_created_event_id
      event = Events::DatasetImportCreated.find(dataset_import_created_event_id)
      event.target2_id if event
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