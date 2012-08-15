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
    created_instance = nil

    if params[:instance][:provision_type] == "create"
      provider = AuroraProvider.create_from_aurora_service
      created_instance = provider.provide!(params[:instance], current_user)
    else
      created_instance = Gpdb::InstanceRegistrar.create!(params[:instance], current_user)
    end

    present created_instance, :status => :created
  end

  def update
    instance = Instance.find(params[:id])
    authorize! :edit, instance
    updated_instance = Gpdb::InstanceRegistrar.update!(instance, params[:instance], current_user)
    present updated_instance
  end
end
