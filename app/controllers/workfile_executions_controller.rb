class WorkfileExecutionsController < ApplicationController
  before_filter :find_schema

  def create
    account = @schema.account_for_user! current_user
    result = SqlExecutor.execute_sql(@schema, account, params[:check_id], params[:sql], :limit => 500)
    present result
  end

  def destroy
    SqlExecutor.cancel_query(@schema, @schema.account_for_user!(current_user), params[:id])
    head :ok
  end

  private

  def find_schema
    @schema = GpdbSchema.find(params[:schema_id])
  end
end