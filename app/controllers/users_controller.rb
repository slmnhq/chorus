class UsersController < ApplicationController
  def index
    if session[:user_id] # should be converted to logged_in? or current_user, and then to a before filter
      render :json => UserPresenter.present_collection(User.scoped)
    else
      head :unauthorized
    end
  end
end