class WorkspaceCsvController < ApplicationController
  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :can_edit_sub_objects, workspace

    present workspace.csv_files.create!(params[:csv])
  end
end