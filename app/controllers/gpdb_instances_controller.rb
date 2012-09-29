class GpdbInstancesController < GpdbController
  def index
    gpdb_instances = if params[:accessible]
                       GpdbInstanceAccess.gpdb_instances_for(current_user).where(:state => 'online')
                     else
                       GpdbInstance.scoped
                     end

    present gpdb_instances, :presenter_options => { :size_only => true }
  end

  def show
    gpdb_instance = GpdbInstance.find(params[:id])
    present gpdb_instance, :presenter_options => { :size_only => true }
  end

  def create
    use_aurora = params[:instance][:provision_type] == "create"
    created_gpdb_instance = Gpdb::InstanceRegistrar.create!(params[:instance], current_user,
                                                       :aurora => use_aurora)
    if use_aurora
      QC.enqueue("AuroraProvider.provide!", created_gpdb_instance.id, params[:instance])
    else
      QC.enqueue("GpdbInstance.refresh", created_gpdb_instance.id)
    end

    present created_gpdb_instance, :status => :created
  end

  def update
    gpdb_instance = GpdbInstance.find(params[:id])
    authorize! :edit, gpdb_instance
    updated_gpdb_instance = Gpdb::InstanceRegistrar.update!(gpdb_instance, params[:instance], current_user)
    present updated_gpdb_instance, :presenter_options => { :size_only => true }
  end
end
