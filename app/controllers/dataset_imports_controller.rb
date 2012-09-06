class DatasetImportsController < ApplicationController
  def show
    import_schedule = ImportSchedule.find_by_workspace_id_and_source_dataset_id(params[:workspace_id], params[:dataset_id])
    present import_schedule
  end

  def create
    src_table = Dataset.find(params[:dataset_id])

    attributes = params[:dataset_import].dup
    attributes[:workspace_id] = params[:workspace_id]
    validate_import_attributes(src_table, attributes)
    src_table.import(attributes, current_user)

    render :json => {}, :status => :created
  end

  def update
    # TODO: not working yet
    render :json => {}, :status => :ok
  end

  private

  def validate_import_attributes(src_table, attributes)
    workspace = Workspace.find(attributes[:workspace_id])
    if workspace.archived?
      workspace.errors.add(:archived, "Workspace cannot be archived for import.")
      raise ActiveRecord::RecordInvalid.new(workspace)
    end

    create_new_table = attributes[:new_table].to_s == "true"
    dst_table_name = attributes[:to_table]
    dst_table = workspace.sandbox.datasets.find_by_name(dst_table_name)

    if create_new_table
      raise ApiValidationError.new(:base, :table_exists,
                                   { :table_name => dst_table_name }) if dst_table
    else
      raise ApiValidationError.new(:base, :table_not_exists,
                                   { :table_name => dst_table_name }) unless dst_table
      raise ApiValidationError.new(:base, :table_not_consistent,
                                   { :src_table_name => src_table.name,
                                     :dest_table_name => dst_table_name }) unless src_table.dataset_consistent?(dst_table)
    end
  end

end
