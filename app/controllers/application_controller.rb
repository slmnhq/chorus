class ApplicationController < ActionController::Base
  before_filter :check_expiration
  after_filter :extend_expiration

  private

  def check_expiration
    head(:unauthorized) unless session[:expires_at] && session[:expires_at] > Time.now
  end

  def extend_expiration
    session[:expires_at] = Chorus::Application.config.session_timeout.from_now
  end
end
