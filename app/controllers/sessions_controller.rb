class SessionsController < ApplicationController
  def create
    user = User.authenticate(params[:username], params[:password])
    if user
      session[:user_id] = user.id
      render :json => UserPresenter.present(user)
    else
      head :unauthorized
    end
  end
end
