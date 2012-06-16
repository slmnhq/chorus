class AnalyzeController < GpdbController
  def create
    database_object = Dataset.find(params[:table_id])
    results = database_object.analyze(authorized_gpdb_account(database_object))
    present(results, :status => :created)
  end
end