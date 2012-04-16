class SessionsController < ApplicationController
  def create
    user = User.authenticate(params[:username], params[:password])
    if user
      session[:user_id] = user.id
      render :json => UserPresenter.present(user), :status => :created
    else
      head :unauthorized
    end
  end

  def destroy
    session.clear
    head :no_content
  end
end
