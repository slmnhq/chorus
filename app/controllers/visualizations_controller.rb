class VisualizationsController < GpdbController
  def create
    dataset = Dataset.find(params[:dataset_id])
    v = Visualization.build(dataset, params[:chart_task])
    v.fetch!(authorized_gpdb_account(dataset.schema.database))
    present v
  end
end