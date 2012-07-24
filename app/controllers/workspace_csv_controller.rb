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
    authorize! :import, csv_file
    csv_file.update_attributes(params[:csvimport])
    QC.enqueue("CsvImporter.import_file", csv_file.id)
    present csv_file
  end
end