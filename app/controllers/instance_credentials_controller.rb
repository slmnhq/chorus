class InstanceCredentialsController < ApplicationController
  def create
    instance = Instance.find(params[:credential][:instance_id])
    credentials = InstanceCredential.new(params[:credential])
    credentials.owner = current_user
    credentials.instance = instance
    credentials.shared = params[:credential][:shared] if current_user.admin? or current_user.id == instance.owner_id
    credentials.save!
    present credentials, :status => :created
  end
end