class GpdbController < ApplicationController
  private

  def authorize_instance_access(resource)
    authorize! :show_contents, resource.instance
  end

  def authorized_gpdb_account(resource)
    authorize_instance_access(resource)
    gpdb_account_for_current_user(resource)
  end

  def gpdb_account_for_current_user(resource)
    resource.instance.account_for_user!(current_user)
  end
end
