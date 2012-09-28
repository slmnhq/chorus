class ImportSchedulePresenter < Presenter
  delegate :id, :start_datetime, :end_date, :frequency, :next_import_at, :workspace_id,
           :truncate, :sample_count, :source_dataset_id, :target_dataset_id, :last_scheduled_at,
           :to_table, :new_table, :is_active, :to => :model

  def to_hash
         {
             :id => (id if is_active),
             :dataset_id => source_dataset_id,
             :workspace_id => workspace_id,
             :start_datetime => start_datetime,
             :end_date => end_date,
             :frequency => frequency,
             :next_import_at => next_import_at,
             :to_table => to_table,
             :truncate => truncate,
             :sample_count => sample_count,
             :destination_dataset_id => target_dataset_id,
             :new_table => new_table,
             :last_scheduled_at => last_scheduled_at,
             :is_active => is_active
         }.merge(:execution_info => {})
  end

  def complete_json?
    true
  end
end

