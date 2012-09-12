class DatasetsController < GpdbController
  def index
    schema = GpdbSchema.find(params[:schema_id])
    account = authorized_gpdb_account(schema)

    options = {:sort => [ {:relname => 'asc' } ]}
    options[:filter] = [:relname => params[:filter]] if params[:filter]
    datasets = Dataset.visible_to(account, schema, options)

    present paginate(datasets)
  end

  def show
    table = Dataset.find_and_verify_in_source(params[:id], current_user)
    present table
  end

end