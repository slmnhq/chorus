class SearchController < ApplicationController

  def show
    @search = Search.new(params)
    present @search
  end

end