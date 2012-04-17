class UsersController < ApplicationController
  def index
    render :json => UserPresenter.present_collection(User.order("LOWER(#{params[:order]})").paginate(params.slice(:page, :per_page)))
  end

  def create
    if current_user.admin?
      user = User.create! params[:user]
      render :json => UserPresenter.present(user), :status => :created
    else
      render :status => :unauthorized, :json => "Only admins can do that"
    end
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
