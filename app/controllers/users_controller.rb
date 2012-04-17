class UsersController < ApplicationController
  def index
    if session[:user_id] # should be converted to logged_in? or current_user, and then to a before filter
      params[:order] ||= "first_name"
      params[:page] ||= 1
      params[:per_page] ||= 50
      order_white_list = ["first_name", "last_name"]
      if (order_white_list.include?(params[:order]))
        render :json => UserPresenter.present_collection(User.order("LOWER(#{params[:order]})").paginate(:page => params[:page], :per_page => params[:per_page]))
      else
        head :bad_request
      end
    else
      head :unauthorized
    end
  end

  def create
    params_clean = params
    params_clean.delete(:controller)
    params_clean.delete(:action)

    user = User.new params_clean # TODO: create (save)

    render :json => UserPresenter.present(user), :status => 201
  end
end
