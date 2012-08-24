# This only covers scheduled imports
# TODO: back Gppipe and in-database imports with Import record,
# make CsvFile inherit from Import

class Import < ActiveRecord::Base

  belongs_to :workspace
  belongs_to :source_dataset, :class_name => 'Dataset'
  belongs_to :user
  belongs_to :import_schedule

end