class DatabaseObjectsController < GpdbController
  def index
    schema = GpdbSchema.find(params[:schema_id])
    account = authorized_gpdb_account(schema)
    GpdbDatabaseObject.refresh(account, schema)

    db_objects = schema.database_objects.
        with_name_like(params[:filter]).
        order("lower(name)").
        paginate(params.slice(:page, :per_page))

    GpdbDatabaseObject.add_metadata!(db_objects, account)

    present db_objects
  end

  def show
    table = GpdbDatabaseObject.find(params[:id])
    present table
  end
end
