class InstanceCredentialsController < ApplicationController
  def create
    instance = Instance.find(params[:credential][:instance_id])
    credential = InstanceCredential.new(params[:credential])
    credential.owner = current_user
    credential.instance = instance
    credential.shared = params[:credential][:shared] if current_user.admin? or current_user.id == instance.owner_id
    credential.save!
    present credential, :status => :created
  end

  def update
    credential = InstanceCredential.find(params[:id])
    raise SecurityTransgression unless (current_user.admin? || current_user.id == credential.owner_id)

    credential.attributes = params[:credential]

    if params[:credential].has_key?(:shared) && (current_user.admin? || credential.instance.owner == current_user)
      credential.shared = params[:credential][:shared]
    end

    credential.save!

    present credential, :status => :ok
  end
end