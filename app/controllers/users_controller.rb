class UsersController < ApplicationController
  def index
    render :json => UserPresenter.present_collection(User.order("LOWER(#{params[:order]})").paginate(params.slice(:page, :per_page)))
  end

  def create
    params_clean = params
    params_clean.delete(:controller)
    params_clean.delete(:action)

    user = User.create params_clean

    render :json => UserPresenter.present(user), :status => :created
  end
end
