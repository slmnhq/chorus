class DatabaseObjectsController < ApplicationController
  def index
    schema = GpdbSchema.find(params[:schema_id])
    account = schema.database.instance.account_for_user! current_user
    data = GpdbDatabaseObject.refresh(account, schema)

    present data
  end
end
