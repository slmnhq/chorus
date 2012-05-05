class InstanceDatabasesController < ApplicationController
  before_filter :load_instance!

  def index
    account = @instance.account_for_user current_user
    raise SecurityTransgression.new unless account
    present Database.from_instance_account(account)
  end

  private
  def load_instance!
    raise ActiveRecord::RecordNotFound unless @instance = Instance.find(params[:instance_id])
  end
end