class ImportSchedule < ActiveRecord::Base
  belongs_to :workspace
  belongs_to :source_dataset, :class_name => 'Dataset'
  belongs_to :user
end