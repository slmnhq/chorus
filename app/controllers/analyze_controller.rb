class AnalyzeController < GpdbController
  def create
    dataset = Dataset.find(params[:table_id])
    results = dataset.analyze(authorized_gpdb_account(dataset))
    present(results, :status => :created)
  end
end