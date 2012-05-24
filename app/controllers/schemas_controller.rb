class SchemasController < ApplicationController
  def index
    database = GpdbDatabase.find(params[:database_id])
    account = database.instance.account_for_user! current_user
    authorize! :index, GpdbSchema, database, account
    present GpdbSchema.refresh(account, database)
  end

  def show
    schema = GpdbSchema.find(params[:id])
    authorize! :show, schema
    present schema
  end
end
