class WorkspacesController < ApplicationController
  def index
    if params[:user_id]
      workspaces = WorkspaceAccess.member_of_workspaces(current_user)
    else
      workspaces = WorkspaceAccess.workspaces_for(current_user)
    end
    workspaces = workspaces.active if params[:active]
    present paginate(workspaces.order("lower(name) ASC"))
  end

  def create
    workspace = current_user.owned_workspaces.create!(params[:workspace])
    workspace.public ?
      Events::PUBLIC_WORKSPACE_CREATED.by(current_user).add(:workspace => workspace) :
      Events::PRIVATE_WORKSPACE_CREATED.by(current_user).add(:workspace => workspace)
    present workspace, :status => :created
  end

  def show
    workspace = Workspace.find(params[:id])
    authorize! :show, workspace
    present workspace
  end

  def update
    w = params[:workspace] || {}
    workspace = Workspace.find(params[:id])

    if w.has_key?(:owner_id) && (workspace.owner.id.to_s != w[:owner_id])
      authorize! :administrative_edit, workspace
      workspace.owner = User.find(w[:owner_id])
    end

    if workspace.public.to_s != w[:public]
      authorize! :administrative_edit, workspace
      workspace.public = w[:public]

    workspace.public ?
      Events::WORKSPACE_MAKE_PUBLIC.by(current_user).add(:workspace => workspace) :
      Events::WORKSPACE_MAKE_PRIVATE.by(current_user).add(:workspace => workspace)
    end

    if w.has_key?(:archived) && (!!workspace.archived_at).to_s != w[:archived]
      authorize! :administrative_edit, workspace
      update_archived_status(workspace)
    end

    if w.has_key?(:sandbox_id) && (workspace.sandbox_id.to_s != w[:sandbox_id])
      authorize! :administrative_edit, workspace
      sandbox_schema =  GpdbSchema.find(w[:sandbox_id])
      authorize! :show_contents, sandbox_schema.instance
      workspace.sandbox = sandbox_schema
      delete_source_dataset(sandbox_schema, workspace)
      create_event_for_sandbox(sandbox_schema, workspace)

      workspace.has_added_sandbox = true
      add_sandbox = true
    end

    authorize! :member_edit, workspace
    workspace.has_changed_settings = true if !add_sandbox
    params[:workspace].delete(:image) if (params[:workspace] && (params[:workspace].include? :image))
    workspace.update_attributes!(params[:workspace])
    present workspace
  end

  private

  def update_archived_status(workspace)
    if params[:workspace][:archived] == "true"
      workspace.archive_as(current_user)
    else
      workspace.unarchive
    end
  end

  def create_event_for_sandbox(sandbox_schema, workspace)
    Events::WORKSPACE_ADD_SANDBOX.by(current_user).add(
      :sandbox_schema => sandbox_schema,
      :workspace => workspace
    )
  end

  def delete_source_dataset(sandbox_schema, workspace)
    workspace_datasets = workspace.bound_datasets
    sandbox_datasets = sandbox_schema.datasets
    sandbox_datasets.each { |sandbox_dataset|
      if workspace_datasets.include?(sandbox_dataset)
        dataset = AssociatedDataset.find_by_dataset_id_and_workspace_id(sandbox_dataset.id, workspace.id)
        dataset.destroy
      end
    }
  end
end
