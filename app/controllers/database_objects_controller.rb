class DatabaseObjectsController < ApplicationController
  def index
    schema = GpdbSchema.find(params[:schema_id])
    account = schema.database.instance.account_for_user! current_user
    GpdbDatabaseObject.refresh(account, schema)

    present schema.database_objects.paginate(params.slice(:page, :per_page))
  end
end
