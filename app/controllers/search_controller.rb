class SearchController < ApplicationController

  def show
    present Search.new(params)
  end

end