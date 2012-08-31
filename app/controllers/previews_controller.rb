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
    task = params[:task]
    schema = GpdbSchema.find(task[:schema_id])
    instance_account = authorized_gpdb_account(schema)

    sql_without_semicolon = task[:query].gsub(';', '');
    sql = "SELECT * FROM (#{sql_without_semicolon}) AS chorus_view LIMIT 500;"
    result = SqlExecutor.execute_sql(schema, instance_account, task[:check_id], sql)
    present(result, :status => :ok)
  end
end
