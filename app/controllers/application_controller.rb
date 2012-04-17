class ApplicationController < ActionController::Base
  before_filter :require_login
  before_filter :set_collection_defaults, :only => :index
  after_filter :extend_expiration

  def logged_in?
    session[:user_id].present?
  end

  private

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

  def set_collection_defaults
    params.reverse_merge!(Chorus::Application.config.collection_defaults)
    require_white_listed_order
  end

  def require_white_listed_order
    head :bad_request unless (Chorus::Application.config.sorting_order_white_list.include?(params[:order]))
  end
end
