class UsersController < ApplicationController
  def index
    if session[:user_id] # should be converted to logged_in? or current_user, and then to a before filter
      params[:order] ||= "first_name"
      order_white_list = ["first_name", "last_name"]
      if (order_white_list.include?(params[:order]))
        render :json => UserPresenter.present_collection(User.order("LOWER(#{params[:order]})"))
      else
        head :bad_request
      end
    else
      head :unauthorized
    end
  end
end
