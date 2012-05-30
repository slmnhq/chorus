class DatabaseObjectsController < GpdbController
  def index
    schema = GpdbSchema.find(params[:schema_id])
    GpdbDatabaseObject.refresh(authorized_gpdb_account(schema), schema)

    present schema.database_objects.includes(:schema => {:database => :instance}).
                with_name_like(params[:filter]).
                order("lower(name)").
                paginate(params.slice(:page, :per_page))
  end
end
