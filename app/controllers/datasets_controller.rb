class DatasetsController < GpdbController
  def index
    schema = GpdbSchema.find(params[:schema_id])
    account = authorized_gpdb_account(schema)
    Dataset.refresh(account, schema)

    datasets = schema.datasets.
        with_name_like(params[:filter]).
        order("lower(name)")

    present paginate(datasets)
  end

  def show
    table = Dataset.find(params[:id])
    present table
  end

  def import

    src_table = Dataset.find(params[:id])
    workspace = Workspace.find(params[:dataset_import]["workspace_id"])
    if workspace.archived?
      head 422
      return
    end
    src_table.import(params[:dataset_import], current_user)
    head :created
  end
end