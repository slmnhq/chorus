class UsersController < ApplicationController
  before_filter :require_admin, :only => :create
  before_filter :load_user, :only => [:show, :update]

  def index
    render :json => UserPresenter.present_collection(User.order("LOWER(#{params[:order]})").paginate(params.slice(:page, :per_page)))
  end

  def show
    render :json => UserPresenter.present(@user)
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
    if current_user.admin?
      @user.admin = params[:user][:admin]
    end
    @user.save!
    render :json => UserPresenter.present(@user)
  end

  private

  def load_user
    @user = User.find_by_id(params[:id])
    head(:not_found) unless @user
  end
end
