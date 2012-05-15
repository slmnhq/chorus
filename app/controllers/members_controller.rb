class MembersController < ApplicationController
  def index
    present Workspace.find(params[:workspace_id]).members
  end
end
