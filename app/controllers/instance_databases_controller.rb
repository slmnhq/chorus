class InstanceDatabasesController < ApplicationController
  def index
    account = Instance.find(params[:instance_id]).account_for_user! current_user
    GpdbDatabase.refresh(account)

    present GpdbDatabase.scoped
  end
end
