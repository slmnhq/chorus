class InstancesController < GpdbController
  def index
    instances = if params[:accessible]
                  InstanceAccess.instances_for(current_user)
                else
                  Instance.scoped
                end

    present instances
  end

  def show
    instance = Instance.find(params[:id])
    present instance
  end

  def create
    created_instance = Gpdb::InstanceRegistrar.create!(params[:instance], current_user)
    present created_instance, :status => :created
  end

  def update
    instance = Instance.find(params[:id])
    authorize! :edit, instance
    updated_instance = Gpdb::InstanceRegistrar.update!(instance, params[:instance], current_user)
    present updated_instance
  end
end
