class GpdbController < ApplicationController
  private

  def authorize_gpdb_instance_access(resource)
    authorize! :show_contents, resource.gpdb_instance
  end

  def authorized_gpdb_account(resource)
    authorize_gpdb_instance_access(resource)
    gpdb_account_for_current_user(resource)
  end

  def gpdb_account_for_current_user(resource)
    resource.gpdb_instance.account_for_user!(current_user)
  end
end
