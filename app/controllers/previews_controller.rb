class PreviewsController < GpdbController
  def create
    database_object = Dataset.find(params[:database_object_id])
    instance_account = authorized_gpdb_account(database_object)

    results = SqlResults.preview_database_object(database_object, instance_account, params[:task][:check_id])
    present(results, :status => :created)
  rescue AsyncQuery::QueryError
    head :request_timeout
  end

  def destroy
    database_object = Dataset.find(params[:database_object_id])
    instance_account = authorized_gpdb_account(database_object)

    SqlResults.cancel_preview(database_object, instance_account, params[:id])
    head :ok
  end
end