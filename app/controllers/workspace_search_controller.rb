class WorkspaceSearchController < ApplicationController

  def show
    present WorkspaceSearch.new(current_user, params)
  end
end