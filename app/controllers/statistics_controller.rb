class StatisticsController < GpdbController
  def show
    dataset = Dataset.find(params[:database_object_id])
    dataset.add_metadata!(authorized_gpdb_account(dataset))
    present dataset.statistics
  end
end
