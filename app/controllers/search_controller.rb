class SearchController < ApplicationController

  def show
    present Search.new(current_user, params)
  end

end