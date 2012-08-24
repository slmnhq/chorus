class ImportSchedule < ActiveRecord::Base
  belongs_to :workspace
  belongs_to :source_dataset, :class_name => 'Dataset'
  belongs_to :user

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