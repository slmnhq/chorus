class WorkspaceCsvController < ApplicationController
  def create
    workspace = Workspace.find(params[:workspace_id])
    authorize! :can_edit_sub_objects, workspace
    csv_file = workspace.csv_files.build(params[:csv])
    csv_file.user = current_user
    csv_file.save!
    present csv_file
  end

  def import
    csv_file = CsvFile.find(params[:id])
    workspace = Workspace.find(params[:workspace_id])
    authorize! :import, csv_file
    csv_file.update_attributes(params[:csvimport])
    CsvImporter.new(csv_file).import_using(workspace.sandbox)
    present csv_file
  end
end