class ExternalTablesController < GpdbController
  def create
    workspace = Workspace.find(params[:workspace_id])
    if workspace.sandbox.blank?
      present_errors({:fields => {:external_table => {:EMPTY_SANDBOX => {}}}}, :status => :unprocessable_entity)
    else
      Hdfs::ExternalTableCreator.create(workspace, authorized_gpdb_account(workspace.sandbox), params[:hdfs_external_table], current_user)
      render :json => {}, :status => :ok
    end

  rescue Hdfs::ExternalTableCreator::CreationFailed => e
    present_errors({:fields => {:external_table => {:CONNECTION_REFUSED => {}}}}, :status => :unprocessable_entity)

  rescue Hdfs::ExternalTableCreator::AlreadyExists => e
    present_errors({:fields => {:external_table => {:EXISTS => {}}}},
                   :status => :unprocessable_entity)
  end
end