# This only covers scheduled imports
# TODO: back Gppipe and in-database imports with Import record,
# make CsvFile inherit from Import

class Import < ActiveRecord::Base

  belongs_to :workspace
  belongs_to :source_dataset, :class_name => 'Dataset'
  belongs_to :user
  belongs_to :import_schedule

  def self.run(import_id)
    Import.find(import_id).run
  end

  def run
    import_attributes = attributes.symbolize_keys
    import_attributes.slice!(:workspace_id, :to_table, :new_table, :sample_count, :truncate, :dataset_import_created_event_id)

    if workspace.sandbox.database != source_dataset.schema.database
      Gppipe.run_import(source_dataset.id, user.id, import_attributes)
    else
      GpTableCopier.run_import(source_dataset.id, user.id, import_attributes)
    end
  end
end