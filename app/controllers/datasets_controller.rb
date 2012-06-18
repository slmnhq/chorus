class DatasetsController < GpdbController
  def index
    schema = GpdbSchema.find(params[:schema_id])
    account = authorized_gpdb_account(schema)
    Dataset.refresh(account, schema)

    datasets = schema.datasets.
        with_name_like(params[:filter]).
        order("lower(name)").
        paginate(params.slice(:page, :per_page))
    present datasets
  end

  def show
    table = Dataset.find(params[:id])
    present table
  end
end
