class DatasetImportsController < ApplicationController

  def show
    import_schedule = ImportSchedule.find_by_workspace_id_and_source_dataset_id(params[:workspace_id], params[:dataset_id])
    present import_schedule
  end

  def create
    src_table = Dataset.find(params[:dataset_id])

    attributes = params[:dataset_import].dup
    attributes[:workspace_id] = params[:workspace_id]

    normalize_import_attributes!(attributes)
    validate_import_attributes(src_table, attributes)
    src_table.import(attributes, current_user)

    render :json => {}, :status => :created
  end

  def update
    src_table = Dataset.find(params[:dataset_id])

    attributes = params[:dataset_import].dup
    attributes[:workspace_id] = params[:workspace_id]

    import_schedule = ImportSchedule.find attributes[:id]
    destination_table_change = (import_schedule[:to_table] != attributes[:to_table])

    normalize_import_attributes!(attributes)
    validate_import_attributes(src_table, attributes, destination_table_change)
    import_schedule.update_attributes!(attributes)

    present import_schedule
  end

  def destroy
    authorize! :can_edit_sub_objects, Workspace.find(params[:workspace_id])
    import_schedule = ImportSchedule.find_by_workspace_id_and_source_dataset_id(params[:workspace_id], params[:dataset_id])
    begin
      import_schedule.destroy
    rescue Exception =>e
      raise ApiValidationError.new(:base, :delete_unsuccessful)

    end

    render :json => {}
  end

  private

  def normalize_import_attributes!(attributes)
    attributes[:new_table] = attributes[:new_table].to_s == 'true'
    if attributes[:import_type] == 'schedule'
      attributes[:frequency].downcase!
      attributes[:is_active] = attributes[:is_active].to_s == 'true'
      attributes[:start_datetime] = Time.parse(attributes[:start_datetime])
    end
    attributes
  end

  def validate_import_attributes(src_table, attributes, destination_change = true)
    workspace = Workspace.find(attributes[:workspace_id])
    if workspace.archived?
      workspace.errors.add(:archived, "Workspace cannot be archived for import.")
      raise ActiveRecord::RecordInvalid.new(workspace)
    end

    dst_table_name = attributes[:to_table]
    dst_table = workspace.sandbox.datasets.find_by_name(dst_table_name)

    if attributes[:new_table] && destination_change
      raise ApiValidationError.new(:base, :table_exists,
                                   { :table_name => dst_table_name }) if dst_table
    elsif destination_change
      raise ApiValidationError.new(:base, :table_not_exists,
                                   { :table_name => dst_table_name }) unless dst_table
      raise ApiValidationError.new(:base, :table_not_consistent,
                                   { :src_table_name => src_table.name,
                                     :dest_table_name => dst_table_name }) unless src_table.dataset_consistent?(dst_table)
    end
  end
end
