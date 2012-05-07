class RootController < ApplicationController

  skip_before_filter :require_login

  def index
  end

  def not_found
    #render :json => {:route => :not_found}, :status => :not_found
    render :json => {:route => :not_found}, :status => :ok # TODO: REWRITE: status OK is weird, but it keeps the front-end working.
  end
end
