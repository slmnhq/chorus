class UsersController < ApplicationController
  before_filter :require_admin, :only => :create
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

  def update
    user = User.find(params[:id])
    if current_user.admin?
      user.admin = params[:user][:admin]
    end
    user.save!
    render :json => UserPresenter.present(user)
  end
end
