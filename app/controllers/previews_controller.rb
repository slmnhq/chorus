class PreviewsController < GpdbController
  def create
    dataset = Dataset.find(params[:dataset_id])
    instance_account = authorized_gpdb_account(dataset)

    results = SqlResults.preview_dataset(dataset, instance_account, params[:task][:check_id])
    present(results, :status => :created)
  rescue AsyncQuery::QueryError => e
    present_errors({:fields => {:query => {:INVALID => {:message => e.to_s}}}}, :status => :bad_request)
  end

  def destroy
    dataset = Dataset.find(params[:dataset_id])
    instance_account = authorized_gpdb_account(dataset)

    SqlResults.cancel_preview(dataset, instance_account, params[:id])
    head :ok
  end
end