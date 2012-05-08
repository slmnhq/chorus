class WorkspacesController < ApplicationController
  def index
    present Workspace.all
  end
end
