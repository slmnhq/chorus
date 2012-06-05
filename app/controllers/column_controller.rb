class ColumnController < GpdbController

  def index
    table = GpdbDatabaseObject.find(params[:database_object_id])
    authorize_gpdb_account(table.schema)
    account = table.instance.account_for_user!(current_user)
    present GpdbColumn.columns_for(account, table.schema.database.name, "\"#{table.schema.name}\".\"#{table.name}\"")

  end
end