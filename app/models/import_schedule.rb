class ImportSchedule < ActiveRecord::Base
  include SoftDelete

  belongs_to :workspace
  belongs_to :source_dataset, :class_name => 'Dataset'
  belongs_to :user
  attr_accessible :start_datetime, :end_date, :sample_count, :truncate, :new_table, :to_table, :frequency, :source_dataset_id,
                  :workspace_id, :is_active

  before_save :set_next_import

  has_many :imports

  scope :ready_to_run, lambda { where('next_import_at <= ?', Time.current) }

  def target_dataset_id
    if dataset_import_created_event_id
      event = Events::DatasetImportCreated.find(dataset_import_created_event_id)
      event.target2_id if event
    end
  end

  def is_active
    deleted_at.nil?
  end

  def is_active=(value)
    if value
      self.deleted_at = nil
    else
      self.deleted_at = Time.now
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
  end
end