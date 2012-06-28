class ExternalTablesController < GpdbController
  def create
    workspace = Workspace.find(params[:workspace_id])
    if !workspace.sandbox.present?
      render :json => "", :status => :unprocessable_entity
    else
      HdfsExternalTable.create(workspace.sandbox, authorized_gpdb_account(workspace.sandbox), params[:hdfs_external_table])
      render :json => {}, :status => :ok
    end
  end
end