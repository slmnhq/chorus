class ApplicationController < ActionController::Base
  before_filter :require_login
  before_filter :set_collection_defaults, :only => :index
  after_filter :extend_expiration
  rescue_from 'ActiveRecord::RecordNotFound', :with => :render_not_found
  rescue_from 'ActiveRecord::RecordInvalid', :with => :render_not_valid
  rescue_from 'ApiValidationError', :with => :render_not_valid
  rescue_from 'SecurityTransgression', :with => :render_forbidden
  rescue_from 'PG::Error', :with => :render_pg_error
  rescue_from 'Allowy::AccessDenied', :with => :render_forbidden

  helper_method :current_user

  private

  def render_not_valid(e)
    present_validation_errors e.record.errors, :status => :unprocessable_entity
  end

  def render_pg_error(e)
    head :unprocessable_entity
  end

  def render_not_found(e)
    present_errors({:record => :NOT_FOUND}, :status => :not_found)
  end

  def render_forbidden(e = nil)
    head(:forbidden)
  end

  def logged_in?
    !!current_user
  end

  def current_user
    @_current_user ||= User.find_by_id(session[:user_id])
  end

  def check_expiration
    head(:unauthorized) unless session[:expires_at] && session[:expires_at] > Time.now
  end

  def extend_expiration
    session[:expires_at] = Chorus::Application.config.chorus['session_timeout_minutes'].minutes.from_now
  end

  def require_login
    head :unauthorized unless logged_in?
    check_expiration
  end

  def require_admin
    render_forbidden unless logged_in? && current_user.admin?
  end

  def require_admin_or_referenced_user
    head :not_found unless logged_in? && (current_user.admin? || current_user == @user)
  end

  def set_collection_defaults
    params.reverse_merge!(Chorus::Application.config.collection_defaults)
  end

  def present(model_or_collection, options={})
    json = {:response => Presenter.present(model_or_collection, view_context)}

    if model_or_collection.respond_to? :current_page
      json[:pagination] = {
        :page => model_or_collection.current_page,
        :per_page => model_or_collection.per_page,
        :records => model_or_collection.total_entries,
        :total => model_or_collection.total_pages
      }
    end

    render options.merge({:json => json})
  end

  def present_errors(errors, options={})
    render options.reverse_merge(:status => :bad_request).merge(:json => {:errors => errors})
  end

  def present_validation_errors(errors, options={})
    present_errors({:fields => ErrorPresenter.new(errors)}, options)
  end
end
