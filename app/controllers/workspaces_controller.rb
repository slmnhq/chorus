class WorkspacesController < ApplicationController
  def index
    if params[:user_id]
      user = User.find(params[:user_id])
      workspaces = user.workspaces.workspaces_for(current_user)
    else
      workspaces = Workspace.workspaces_for(current_user)
    end
    workspaces = workspaces.active if params[:active]
    present paginate(workspaces.includes([:owner, :archiver, {:sandbox => {:database => :gpdb_instance}}]).order("lower(name) ASC"))
  end

  def create
    workspace = current_user.owned_workspaces.build(params[:workspace])
    Workspace.transaction do
      workspace.save!
      workspace.public ?
          Events::PublicWorkspaceCreated.by(current_user).add(:workspace => workspace) :
          Events::PrivateWorkspaceCreated.by(current_user).add(:workspace => workspace)
    end
    present workspace, :status => :created
  end

  def show
    workspace = Workspace.find(params[:id])
    authorize! :show, workspace
    present workspace
  end

  def update
    workspace = Workspace.find(params[:id])
    original_archived = workspace.archived?.to_s
    attributes = params[:workspace]
    attributes[:archiver] = current_user if attributes[:archived] == 'true'
    workspace.attributes = attributes
    authorize! :update, workspace
    Workspace.transaction do
      if attributes[:schema_name]
        begin
          if attributes[:database_name]
            gpdb_instance = GpdbInstance.find(attributes[:instance_id])
            database = gpdb_instance.create_database(attributes[:database_name], current_user)
          else
            database = GpdbDatabase.find(attributes[:database_id])
          end
          GpdbSchema.refresh(database.instance.account_for_user!(current_user), database)
          workspace.sandbox = database.create_schema(attributes[:schema_name], current_user)
        rescue Exception => e
          instance.delete_database(attributes[:database_name], current_user) if attributes[:database_name]
          raise ApiValidationError.new(database ? :schema : :database, :generic, {:message => e.message})
        end
      end
      create_workspace_events(workspace, original_archived)
      workspace.save!
    end

    present workspace
  end

  private

  def create_workspace_events(workspace, original_archived)
    if workspace.public_changed?
      workspace.public ?
          Events::WorkspaceMakePublic.by(current_user).add(:workspace => workspace) :
          Events::WorkspaceMakePrivate.by(current_user).add(:workspace => workspace)
    end
    if params[:workspace][:archived] != original_archived
      workspace.archived? ?
          Events::WorkspaceArchived.by(current_user).add(:workspace => workspace) :
          Events::WorkspaceUnarchived.by(current_user).add(:workspace => workspace)
    end

    if workspace.sandbox_id_changed? && workspace.sandbox
      Events::WorkspaceAddSandbox.by(current_user).add(
          :sandbox_schema => workspace.sandbox,
          :workspace => workspace
      )
    end
  end
end

