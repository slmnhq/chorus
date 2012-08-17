class PreviewsController < GpdbController
  def create
    dataset = Dataset.find(params[:dataset_id])
    instance_account = authorized_gpdb_account(dataset)

    result = SqlExecutor.preview_dataset(dataset, instance_account, params[:task][:check_id])
    present(result, :status => :created)
  end

  def destroy
    dataset = Dataset.find(params[:dataset_id])
    instance_account = authorized_gpdb_account(dataset)

    SqlExecutor.cancel_query(dataset, instance_account, params[:id])
    head :ok
  end
end
