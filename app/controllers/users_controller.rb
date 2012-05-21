class UsersController < ApplicationController
  before_filter :load_user, :only => [:show, :update, :destroy]
  before_filter :require_admin, :only => [:create, :destroy, :ldap]
  before_filter :require_admin_or_referenced_user, :only => :update

  def index
    present User.order(params[:order]).paginate(params.slice(:page, :per_page))
  end

  def show
    present @user
  end

  def create
    present User.create!(params[:user]), :status => :created
  end

  def update
    @user.attributes = params[:user]
    @user.admin = params[:user][:admin] if current_user.admin?
    @user.save!
    present @user
  end

  def destroy
    @user.destroy
    render :json => {}
  end

  def ldap
    users = LdapClient.search(params[:username]).map do |userJson|
      User.new userJson
    end
    present users
  end

  private

  def load_user
    @user = User.find(params[:id])
  end
end