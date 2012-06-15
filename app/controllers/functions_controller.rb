class FunctionsController < GpdbController

  def index
    schema = GpdbSchema.find(params[:schema_id])
    schema_functions = schema.stored_functions(authorized_gpdb_account(schema))
    present schema_functions
  end
end