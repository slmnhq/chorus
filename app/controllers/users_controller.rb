class UsersController < ApplicationController
  before_filter :require_admin, :only => :create
  before_filter :load_user, :only => [:show, :update]

  def index
    present User.order("LOWER(#{params[:order]})").paginate(params.slice(:page, :per_page))
  end

  def show
    present @user
  end

  def create
    present User.create!(params[:user]), :status => :created
  end

  def update
    unless current_user.admin? || current_user == @user
      raise ActiveRecord::RecordNotFound
    end

    @user.attributes = params[:user]
    @user.admin = params[:user][:admin] if current_user.admin?
    @user.save!
    present @user
  end

  private

  def load_user
    @user = User.find_by_id(params[:id])
    head(:not_found) unless @user
  end
end
