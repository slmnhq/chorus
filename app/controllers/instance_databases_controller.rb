class InstanceDatabasesController < ApplicationController
  def index
    instance = Instance.find(params[:instance_id])
    account = instance.account_for_user! current_user
    GpdbDatabase.refresh(account)

    present instance.databases.order("lower(name)")
  end
end
