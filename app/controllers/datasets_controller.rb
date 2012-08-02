class SqlCommandFailed < Exception
end

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
    schema = src_table.schema
    account = authorized_gpdb_account(schema)
    dest_table_name = params["dataset_import"]["to_table"]
    create_command = "CREATE TABLE #{dest_table_name} (LIKE #{src_table.name} INCLUDING DEFAULTS INCLUDING CONSTRAINTS INCLUDING INDEXES);"
    copy_command = "INSERT INTO #{dest_table_name} (SELECT * FROM #{src_table.name})"
    if params["dataset_import"]["use_limit_rows"] == "true"
      if params['dataset_import']['sample_count'].to_i < 0
        raise SqlCommandFailed, "Limit can not be Negative"
      end
      copy_command += " LIMIT #{params['dataset_import']['sample_count']}"
    end
    schema.with_gpdb_connection(account) do |connection|
      connection.exec_query("START TRANSACTION")
      connection.execute(create_command)
      result = connection.execute(copy_command)
      connection.exec_query("COMMIT")
    end
    head :created
  end
end