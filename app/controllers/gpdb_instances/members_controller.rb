module GpdbInstances
  class MembersController < ApplicationController
    wrap_parameters :account, :include => [:db_username, :db_password, :owner_id]

    def index
      accounts = GpdbInstance.find(params[:gpdb_instance_id]).accounts
      present paginate(accounts.includes(:owner).order(:id))
    end

    def create
      gpdb_instance = GpdbInstance.unshared.owned_by(current_user).find(params[:gpdb_instance_id])

      account = gpdb_instance.accounts.find_or_initialize_by_owner_id(params[:account][:owner_id])
      account.attributes = params[:account]

      Gpdb::ConnectionChecker.check!(gpdb_instance, account)
      account.save!

      present account, :status => :created
    end

    def update
      gpdb_instance = GpdbInstance.owned_by(current_user).find(params[:gpdb_instance_id])

      account = gpdb_instance.accounts.find(params[:id])
      account.attributes = params[:account]
      Gpdb::ConnectionChecker.check!(gpdb_instance, account)
      account.save!

      present account, :status => :ok
    end

    def destroy
      gpdb_instance = GpdbInstance.owned_by(current_user).find(params[:gpdb_instance_id])
      account = gpdb_instance.accounts.find(params[:id])

      account.destroy
      render :json => {}
    end
  end
end
