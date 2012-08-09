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

    begin
      if workspace.sandbox.database == src_table.schema.database
        src_table.import(params[:dataset_import], current_user)
      else
        src_table.gpfdist_import(params[:dataset_import], workspace.sandbox, current_user)
      end

      create_success_event(params[:dataset_import]["to_table"], src_table, workspace)
      render :json => { :status => "UNIMPLEMENTED" }
    rescue Exception => e
      create_failed_event(params[:dataset_import]["to_table"], src_table, workspace, e.message)
      raise e
    end
  end

  private
  def destination_dataset(source_table, to_table)
    Dataset.refresh(source_table.schema.instance.account_for_user!(current_user), source_table.schema)
    source_table.schema.datasets.find_by_name(to_table)
  end

  def create_success_event(to_table, source_table, workspace)
    Events::DATASET_IMPORT_SUCCESS.by(current_user).add(
        :workspace => workspace,
        :dataset => destination_dataset(source_table, to_table),
        :source_dataset => source_table
    )
  end

  def create_failed_event(to_table, source_table, workspace, error_message)
    Events::DATASET_IMPORT_FAILED.by(current_user).add(
        :workspace => workspace,
        :destination_table => to_table,
        :error_message => error_message,
        :source_dataset => source_table
    )
  end
end