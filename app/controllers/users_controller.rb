class UsersController < ApplicationController
  def index
    render :json => UserPresenter.present_collection(User.order("LOWER(#{params[:order]})").paginate(params.slice(:page, :per_page)))
  end

  def create
    user = User.create! params.except(:controller, :action)
    render :json => UserPresenter.present(user), :status => :created

  rescue ActiveRecord::RecordInvalid => e
    render :json => { :errors => { :fields => e.record.errors } },
           :status => :unprocessable_entity
  end
end
