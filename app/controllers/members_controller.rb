class MembersController < ApplicationController
  before_filter :load_workspace

  def show
    present @workspace.members
  end

  private

  def load_workspace
    @workspace = Workspace.find(params[:id])
  end
end
