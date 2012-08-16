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

    if params[:csvimport][:type] == "existingTable"
      # Read and calculate correct column names
      column_names = JSON.parse(params[:csvimport][:columns_map]).map { |column| column["targetOrder"] }
      params[:csvimport] = params[:csvimport].merge(:column_names => column_names)
    else
      table_name = params[:csvimport][:to_table]
      if csv_file.table_already_exists(table_name)
        raise ApiValidationError.new(:base, :table_exists, { :table_name => table_name, :suggested_table_name => csv_file.suggest_table_name(table_name) })
      end
      csv_file.new_table = true
    end

    params[:csvimport][:file_contains_header] = params[:csvimport].delete(:has_header)
    csv_file.update_attributes(params[:csvimport])
    QC.enqueue("CsvImporter.import_file", csv_file.id)
    present csv_file
  end
end