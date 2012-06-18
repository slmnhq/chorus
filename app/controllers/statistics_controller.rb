class StatisticsController < GpdbController
  def show
    dataset = Dataset.find(params[:dataset_id])
    dataset.add_metadata!(authorized_gpdb_account(dataset))
    present dataset.statistics
  end
end
