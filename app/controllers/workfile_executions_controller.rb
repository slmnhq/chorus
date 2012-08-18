class WorkfileExecutionsController < ApplicationController
  before_filter :find_schema, :verify_workspace

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

  def verify_workspace
    workfile = Workfile.find(params[:workfile_id] || params[:id])
    present_errors({:fields => {:workspace => {:ARCHIVED => {}}}}, :status => :unprocessable_entity) if workfile.workspace.archived?
  end
end