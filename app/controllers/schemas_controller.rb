class SchemasController < GpdbController
  def index
    database = GpdbDatabase.find(params[:database_id])
    schemas = GpdbSchema.visible_to(authorized_gpdb_account(database), database)
    present schemas
  end

  def show
    schema = GpdbSchema.find_and_verify_in_source(params[:id], current_user)
    authorize_gpdb_instance_access(schema)
    present schema
  end
end
