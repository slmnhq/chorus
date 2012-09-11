class ImportSchedulePresenter < Presenter
  delegate :id, :start_datetime, :end_date, :frequency, :next_import_at,
           :truncate, :sample_count, :last_scheduled_at, :to_table, :target_dataset_id, :to => :model

  def to_hash
    {:schedule_info =>
         {
             :id => id,
             :start_datetime => start_datetime,
             :end_date => end_date,
             :frequency => frequency,
             :next_import_at => next_import_at,
             :to_table => to_table,
             :truncate => truncate,
             :sample_count => sample_count,
             :last_scheduled_at => last_scheduled_at,
             :destination_dataset_id => target_dataset_id
         }
    }.merge(:execution_info => {})
  end
end

