class WorkfileExecutionsController < ApplicationController
  def create
    schema = GpdbSchema.find(params[:schema_id])
    account = schema.account_for_user! current_user
    result = SqlExecutor.execute_sql(schema, account, params[:check_id], params[:sql], :limit => 500)
    present result
  end
end