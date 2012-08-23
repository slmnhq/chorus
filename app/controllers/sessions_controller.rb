class SessionsController < ApplicationController
  skip_before_filter :require_login, :except => :show
  skip_before_filter :extend_expiration

  def create
    user = CredentialsValidator.user(params[:session][:username], params[:session][:password])
    session[:user_id] = user.id
    force_extend_expiration
    present user, :status => :created
  rescue CredentialsValidator::Invalid => e
    present_validation_errors e.record.errors, :status => :unauthorized
  end

  def destroy
    session.clear
    head :no_content
  end

  def show
    present current_user
  end
end
