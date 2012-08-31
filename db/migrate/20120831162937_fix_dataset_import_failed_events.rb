class FixDatasetImportFailedEvents < ActiveRecord::Migration
  def up
    Events::DatasetImportFailed.all.each do |e|
      next unless e.additional_data.has_key?('source_dataset_id')
      dataset_id = e.additional_data.delete('source_dataset_id')
      e.target2_type = 'Dataset'
      e.target2_id = dataset_id
      e.save!
    end
  end

  def down
    Events::DatasetImportFailed.all.each do |e|
      e.additional_data['source_dataset_id'] = e.target2_id
      e.target2_type = nil
      e.target2_id = nil
      e.save!
    end
  end
end
