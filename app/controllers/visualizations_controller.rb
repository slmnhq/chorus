class VisualizationsController < GpdbController
  def create
    dataset = Dataset.find(params[:dataset_id])
    v = Visualization.build(dataset, params[:chart_task])
    v.fetch!(authorized_gpdb_account(dataset.schema.database), params[:chart_task][:check_id] + "_#{current_user.id}")
    present v
  rescue CancelableQuery::QueryError => e
    present_errors({:fields => {:query => {:INVALID => {:message => e.to_s}}}}, :status => :bad_request)
  end

  def destroy
    dataset = Dataset.find(params[:dataset_id])
    instance_account = authorized_gpdb_account(dataset)
    SqlExecutor.cancel_query(dataset, instance_account, params[:id] + "_#{current_user.id}")
    head :ok
  end
end
