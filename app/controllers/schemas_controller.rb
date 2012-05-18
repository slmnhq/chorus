class SchemasController < ApplicationController
  def index
    database = GpdbDatabase.find(params[:database_id])
    account = database.instance.account_for_user! current_user
    present GpdbSchema.refresh(account, database)
  end

  def show
    schema = AccessPolicy.schemas_for(current_user).find(params[:id])
    present schema
  end
end
