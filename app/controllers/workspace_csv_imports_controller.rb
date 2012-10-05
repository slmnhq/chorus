# TODO csv imports should be backed by an Import record, so we can know when a table was last imported from CSV [#36276029]
class WorkspaceCsvImportsController < ApplicationController
  wrap_parameters :csvimport, :exclude => []

  def create
    csv_file = CsvFile.find params[:csv_id]
    authorize! :create, csv_file

    if params[:csvimport][:type] == "existingTable"
      # Read and calculate correct column names
      column_names = JSON.parse(params[:csvimport][:columns_map]).map { |column| column["targetOrder"] }
      params[:csvimport] = params[:csvimport].merge(:column_names => column_names)
    else
      table_name = params[:csvimport][:to_table]
      if csv_file.table_already_exists(table_name)
        raise ApiValidationError.new(:base, :table_exists, { :table_name => table_name })
      end
      csv_file.new_table = true
    end

    params[:csvimport][:file_contains_header] = params[:csvimport].delete(:has_header)
    csv_file.update_attributes(params[:csvimport])

    import_created_event = create_import_event(csv_file)
    QC.enqueue("CsvImporter.import_file", csv_file.id, import_created_event.id)

    present csv_file
  end

  private

  def create_import_event(csv_file)
    schema = csv_file.workspace.sandbox
    Events::FileImportCreated.by(csv_file.user).add(
        :workspace => csv_file.workspace,
        :dataset => schema.datasets.find_by_name(csv_file.to_table),
        :file_name => csv_file.contents_file_name,
        :import_type => 'file',
        :destination_table => csv_file.to_table
    )
  end
end