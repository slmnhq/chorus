class InstanceDatabasesController < GpdbController
  def index
    gpdb_instance = GpdbInstance.find(params[:gpdb_instance_id])
    databases = GpdbDatabase.refresh(authorized_gpdb_account(gpdb_instance))
    databases = (databases & gpdb_instance.databases)
      .sort! { |a,b| a.name.downcase <=> b.name.downcase }

    present databases
  end

  def show
    database = GpdbDatabase.find(params[:id])
    authorize_gpdb_instance_access(database)
    present database
  end
end
