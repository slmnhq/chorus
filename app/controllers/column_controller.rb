class ColumnController < GpdbController

  def index
    table = GpdbDatabaseObject.find(params[:database_object_id])
    present GpdbColumn.columns_for(authorized_gpdb_account(table), table)
  end
end