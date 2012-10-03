class RootController < ApplicationController

  skip_before_filter :require_login

  def index
  end

  def not_found
    #render :json => {:route => :not_found}, :status => :not_found
    render :json => {:route => :not_found}, :status => :ok # TODO: Revert to a regular 404 after all api calls have been implemented.
  end
end
