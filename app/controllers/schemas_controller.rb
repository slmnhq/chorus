class SchemasController < ApplicationController
  def index
    instance = Instance.find(params[:instance_id])
    account = instance.account_for_user! current_user
    database = instance.databases.find(params[:database_id])
    present GpdbSchema.refresh(account, database)
  end
end
