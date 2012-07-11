class VisualizationsController < GpdbController
  def create
    dataset = Dataset.find(params[:dataset_id])
    v = Visualization.build(dataset, params[:chart_task])
    v.fetch!(authorized_gpdb_account(dataset.schema.database), params[:check_id])
    present v
  rescue CancelableQuery::QueryError => e
    present_errors({:fields => {:query => {:INVALID => {:message => e.to_s}}}}, :status => :bad_request)
  end
end