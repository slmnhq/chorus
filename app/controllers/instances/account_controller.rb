module Instances
  class AccountController < ApplicationController
    def show
      present instance.account_for_user(current_user)
    end

    def create
      present updated_account, :status => :created
    end

    def update
      present updated_account, :status => :ok
    end

    private

    def updated_account
      instance = Instance.unshared.find(params[:instance_id])

      account = instance.accounts.find_or_initialize_by_owner_id(current_user.id)
      account.attributes = params[:account]
      Gpdb::ConnectionChecker.check!(instance, account)
      account.save!
      account
    end

    def instance
      Instance.find(params[:instance_id])
    end
  end
end
