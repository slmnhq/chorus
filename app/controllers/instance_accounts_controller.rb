class InstanceAccountsController < ApplicationController
  def index
    accounts = Instance.find(params[:instance_id]).accounts
    present accounts.paginate(params.slice(:page, :per_page))
  end

  def create
    instance = Instance.unshared.owned_by(current_user).find(params[:instance_id])

    account = instance.accounts.find_or_initialize_by_owner_id(params[:account][:owner_id])
    account.update_attributes! params[:account]
    present account, :status => :created
  end

  def update
    instance = Instance.owned_by(current_user).find(params[:instance_id])

    account = instance.accounts.find(params[:id])
    account.update_attributes! params[:account]
    present account, :status => :ok
  end
end