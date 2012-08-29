class InstanceDatabasesController < GpdbController
  def index
    gpdb_instance = GpdbInstance.find(params[:gpdb_instance_id])
    GpdbDatabase.refresh(authorized_gpdb_account(gpdb_instance))
    present gpdb_instance.databases.order("lower(name)")
  end

  def show
    database = GpdbDatabase.find(params[:id])
    authorize_gpdb_instance_access(database)
    present database
  end
end
