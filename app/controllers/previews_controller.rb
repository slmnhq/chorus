class PreviewsController < GpdbController
  def create
    dataset = Dataset.find(params[:database_object_id])
    instance_account = authorized_gpdb_account(dataset)

    results = SqlResults.preview_dataset(dataset, instance_account, params[:task][:check_id])
    present(results, :status => :created)
  rescue AsyncQuery::QueryError
    head :request_timeout
  end

  def destroy
    dataset = Dataset.find(params[:database_object_id])
    instance_account = authorized_gpdb_account(dataset)

    SqlResults.cancel_preview(dataset, instance_account, params[:id])
    head :ok
  end
end