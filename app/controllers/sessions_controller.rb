class SessionsController < ApplicationController
  skip_before_filter :check_expiration
  skip_after_filter :extend_expiration, :only => :destroy

  def create
    user = CredentialsValidator.user(params[:username], params[:password])
    session[:user_id] = user.id
    render :json => UserPresenter.present(user),
           :status => :created

  rescue CredentialsValidator::Invalid => e
    render :json => { :errors => { :fields => e.record.errors } },
           :status => :unauthorized
  end

  def destroy
    session.clear
    head :no_content
  end
end