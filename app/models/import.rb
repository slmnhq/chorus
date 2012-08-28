# This only covers scheduled imports
# TODO: back Gppipe and in-database imports with Import record,
# make CsvFile inherit from Import

class Import < ActiveRecord::Base

  belongs_to :workspace
  belongs_to :source_dataset, :class_name => 'Dataset'
  belongs_to :user
  belongs_to :import_schedule

  def self.run(source_dataset_id, user_id, attributes)
    if attributes[:remote_copy]
      copy_method = "Gppipe.run_import"
    else
      copy_method = "GpTableCopier.run_import"
    end
    QC.enqueue(copy_method, source_dataset_id, user_id, attributes)
  end
end