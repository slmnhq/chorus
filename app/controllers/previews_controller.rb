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

  def preview_sql
    schema = GpdbSchema.find(params[:schema_id])
    instance_account = authorized_gpdb_account(schema)
    result = SqlExecutor.execute_sql(schema, instance_account, params[:check_id], params[:query])
    present(result, :status => :ok)
  end
end
