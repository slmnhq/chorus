class SchemasController < ApplicationController
  before_filter :load_instance!

  def index
    account = @instance.account_for_user! current_user
    raise SecurityTransgression.new unless account
    present Schema.from_instance_account_and_db(account, params[:database_id])
  end

  private

  def load_instance!
    raise ActiveRecord::RecordNotFound unless @instance = Instance.find(params[:instance_id])
  end
end