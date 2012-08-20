class WorkfileExecutionsController < ApplicationController
  before_filter :find_schema, :find_workfile, :verify_workspace, :check_authorization
  require_params :check_id, :only => :create
  require_params :id, :only => :destroy, :field_name => :check_id

  def create
    account = @schema.account_for_user! current_user
    result = SqlExecutor.execute_sql(@schema, account, params[:check_id], params[:sql], :limit => 500)
    @workfile.execution_schema = @schema
    @workfile.save!
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

  def find_workfile
    @workfile = Workfile.find(params[:workfile_id] || params[:id])
  end

  def verify_workspace
    present_errors({:fields => {:workspace => {:ARCHIVED => {}}}}, :status => :unprocessable_entity) if @workfile.workspace.archived?
  end

  def check_authorization
    authorize! :can_edit_sub_objects, @workfile.workspace
  end
end