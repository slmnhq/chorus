class ExternalTablesController < GpdbController
  wrap_parameters :hdfs_external_table, :exclude => []

  def create
    workspace = Workspace.find(params[:workspace_id])
    if workspace.sandbox.blank?
      present_validation_error(:EMPTY_SANDBOX)
    else
      Hdfs::ExternalTableCreator.create(workspace, authorized_gpdb_account(workspace.sandbox),
                                        params[:hdfs_external_table], current_user)
      render :json => {}, :status => :ok
    end

  rescue Hdfs::ExternalTableCreator::CreationFailed => e
    present_validation_error(:CONNECTION_REFUSED)

  rescue Hdfs::ExternalTableCreator::AlreadyExists => e
    present_validation_error(:EXISTS)
  end

  private

  def present_validation_error(error_code)
    present_errors({:fields => {:external_table => {error_code => {}}}},
                   :status => :unprocessable_entity)
  end
end