class RootController < ApplicationController

  skip_before_filter :require_login

  def index
  end

  def not_found
    render :text => '{"route": "not found"}'
  end
end
