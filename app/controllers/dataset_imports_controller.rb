class DatasetImportsController < ApplicationController
  def show
    import_schedule = ImportSchedule.find_by_workspace_id_and_source_dataset_id(params[:workspace_id], params[:dataset_id])
    present import_schedule
  end
end
