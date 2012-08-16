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
    table = Dataset.find_and_verify_in_source(params[:id], current_user)
    present table
  end

  def import
    src_table = Dataset.find(params[:id])
    workspace = Workspace.find(params[:dataset_import]["workspace_id"])
    if workspace.archived?
      head 422
      return
    end

    new_table_boolean = to_bool(params[:dataset_import]["new_table"])
    dest_table = Dataset.find_by_name(params[:dataset_import]["to_table"])
    if !new_table_boolean
      raise ApiValidationError.new(:base, :table_not_exists, { :table_name => params[:dataset_import][:to_table] }) unless dest_table
      raise ApiValidationError.new(:base, :table_not_consistent, { :src_table_name => src_table.name, :dest_table_name => params[:dataset_import][:to_table] }) unless src_table.dataset_consistent?(dest_table)
    end

    begin
      if workspace.sandbox.database == src_table.schema.database
        src_table.import(params[:dataset_import], workspace, current_user, new_table_boolean)
      else
        src_table.gpfdist_import(params[:dataset_import], workspace, current_user, new_table_boolean)
      end

      render :json => {}, :status => :created
    end
  end

  def to_bool(str)
    str == "false" ? false : true
  end
end