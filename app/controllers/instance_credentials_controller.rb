class InstanceCredentialsController < ApplicationController
  before_filter :load_instance
  before_filter :load_credential, :only => [:update]

  def index
    credentials = InstanceCredential.where(:instance_id => params[:instance_id])
    credentials = credentials.where(:owner_id => params[:user_id]) if params[:user_id]
    present credentials.paginate(params.slice(:page, :per_page))
  end

  def create
    raise ActiveRecord::RecordInvalid.new(@instance) if @instance.shared? && @instance.credentials.count > 0
    raise SecurityTransgression if @instance.shared? unless current_user.admin? or @instance.owner == current_user
    credential = @instance.credentials.build params[:credentials]
    credential.owner = current_user
    credential.save!
    present credential, :status => :created
  end

  def update
    raise SecurityTransgression unless (current_user.admin? || current_user.id == @credential.owner_id)
    @credential.update_attributes params[:credentials]
    present @credential, :status => :ok
  end

  private

  def load_instance
    @instance = Instance.find(params[:instance_id])
  end

  def load_credential
    @credential = InstanceCredential.find(params[:id])
  end
end