class WorkspaceCsvController < ApplicationController
  wrap_parameters :csv, :exclude => []

  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :can_edit_sub_objects, workspace
    csv_file = workspace.csv_files.create(params[:csv]) do |file|
      file.user = current_user
    end
    present csv_file
  end
end