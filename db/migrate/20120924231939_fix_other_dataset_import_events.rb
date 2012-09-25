class FixOtherDatasetImportEvents < ActiveRecord::Migration
  class MigrationEvent < ActiveRecord::Base
    include SoftDelete

    self.table_name = :events
    self.inheritance_column = :action
    serialize :additional_data, JsonHashSerializer
  end

  def up
    MigrationEvent.where(:action => ['Events::DatasetImportCreated', 'Events::DatasetImportSuccess']).all.each do |e|
      next unless e.additional_data.has_key?('source_dataset_id')
      dataset_id = e.additional_data.delete('source_dataset_id')
      e.target1_type = 'Dataset'
      e.target1_id = dataset_id
      e.save!
    end
  end

  def down
    MigrationEvent.where(:action => ['Events::DatasetImportCreated', 'Events::DatasetImportSuccess']).all.each do |e|
      e.additional_data['source_dataset_id'] = e.target1_id
      e.target1_type = nil
      e.target1_id = nil
      e.save!
    end
  end
end