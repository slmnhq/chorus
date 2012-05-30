class InstanceDatabasesController < GpdbController
  def index
    instance = Instance.find(params[:instance_id])
    GpdbDatabase.refresh(authorized_gpdb_account(instance))
    present instance.databases.order("lower(name)")
  end

  def show
    database = GpdbDatabase.find(params[:id])
    authorize_gpdb_account(database)
    present database
  end
end
