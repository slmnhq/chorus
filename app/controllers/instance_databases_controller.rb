class InstanceDatabasesController < ApplicationController
  def index
    account = Instance.find(params[:instance_id]).account_for_user! current_user
    raise SecurityTransgression.new unless account
    present Database.from_instance_account(account)
  end
end