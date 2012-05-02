class InstanceAccountsController < ApplicationController
  before_filter :load_instance
  before_filter :load_account, :only => [:update]

  def index
    accounts = InstanceAccount.where(:instance_id => params[:instance_id])
    accounts = accounts.where(:owner_id => params[:user_id]) if params[:user_id]
    present accounts.paginate(params.slice(:page, :per_page))
  end

  def create
    raise ActiveRecord::RecordInvalid.new(@instance) if @instance.shared? && @instance.accounts.count > 0
    raise SecurityTransgression if @instance.shared? unless current_user.admin? or @instance.owner == current_user
    account = @instance.accounts.build params[:account]
    account.owner = current_user
    account.save!
    present account, :status => :created
  end

  def update
    raise SecurityTransgression unless (current_user.admin? || current_user.id == @account.owner_id)
    @account.update_attributes params[:account]
    present @account, :status => :ok
  end

  private

  def load_instance
    @instance = Instance.find(params[:instance_id])
  end

  def load_account
    @account = InstanceAccount.find(params[:id])
  end
end