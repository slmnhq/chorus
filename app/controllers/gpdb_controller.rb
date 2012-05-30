class GpdbController < ApplicationController
  def authorize_gpdb_account(resource)
    authorize! :show, resource.instance
  end

  def authorized_gpdb_account(resource)
    authorize_gpdb_account(resource)
    resource.instance.account_for_user!(current_user)
  end
end