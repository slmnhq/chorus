class ImportPresenter < Presenter
  delegate :created_at, :to_table, :target_dataset_id, :source_dataset_id, :to => :model

  def to_hash
    {
        :execution_info => {
          :to_table => to_table,
          :to_table_id => target_dataset_id,
          :started_stamp => created_at,
          :completed_stamp => created_at,
          :state => "success",
          :source_id => source_dataset_id,
          :source_table => Dataset.find(source_dataset_id).name
        }
    }
  end
end

