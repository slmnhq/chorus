class ApplicationController < ActionController::Base
  before_filter :require_login
  before_filter :set_collection_defaults, :only => :index
  after_filter :extend_expiration

  def logged_in?
    !!current_user
  end

  private

  def current_user
    @_current_user ||= User.find_by_id(session[:user_id])
  end

  def check_expiration
    head(:unauthorized) unless session[:expires_at] && session[:expires_at] > Time.now
  end

  def extend_expiration
    session[:expires_at] = Chorus::Application.config.session_timeout.from_now
  end

  def require_login
    head :unauthorized unless logged_in?
    check_expiration
  end

  def require_admin
    head :unauthorized unless logged_in? && current_user.admin?
  end

  def set_collection_defaults
    params.reverse_merge!(Chorus::Application.config.collection_defaults)
    require_white_listed_order
  end

  def require_white_listed_order
    head :bad_request unless (Chorus::Application.config.sorting_order_white_list.include?(params[:order]))
  end
end
