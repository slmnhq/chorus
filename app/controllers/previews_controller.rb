class PreviewsController < GpdbController
  def create
    database_object = GpdbDatabaseObject.find(params[:database_object_id])

    results = SqlResults.preview_database_object(database_object, authorized_gpdb_account(database_object))
    present(results, :status => :created)
  end
end