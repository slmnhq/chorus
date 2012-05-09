module Instances
  class MembersController < ApplicationController
    def index
      accounts = Instance.find(params[:instance_id]).accounts
      present accounts.paginate(params.slice(:page, :per_page))
    end

    def create
      instance = Instance.unshared.owned_by(current_user).find(params[:instance_id])

      account = instance.accounts.find_or_initialize_by_owner_id(params[:account][:owner_id])
      account.attributes = params[:account]

      Gpdb::ConnectionChecker.check!(instance, account)
      account.save!

      present account, :status => :created
    end

    def update
      instance = Instance.owned_by(current_user).find(params[:instance_id])

      account = instance.accounts.find(params[:id])
      account.attributes = params[:account]
      Gpdb::ConnectionChecker.check!(instance, account)
      account.save!

      present account, :status => :ok
    end

    def destroy
      raise SecurityTransgression if Instance.find(params[:instance_id]).owner != current_user
      account = InstanceAccount.find_by_instance_id_and_id(params[:instance_id], params[:id])
      raise ActiveRecord::RecordNotFound unless account
      account.delete
      render :json => {}
    end
  end
end
