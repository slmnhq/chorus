class WorkspacesController < ApplicationController
  def index
    if params[:user_id]
      user = User.find(params[:user_id])
      workspaces = user.workspaces.workspaces_for(current_user)
    else
      workspaces = Workspace.workspaces_for(current_user)
    end
    workspaces = workspaces.active if params[:active]
    present paginate(workspaces.order("lower(name) ASC"))
  end

  def create
    workspace = current_user.owned_workspaces.build(params[:workspace])
    Workspace.transaction do
      workspace.save!
      workspace.public ?
          Events::PUBLIC_WORKSPACE_CREATED.by(current_user).add(:workspace => workspace) :
          Events::PRIVATE_WORKSPACE_CREATED.by(current_user).add(:workspace => workspace)
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
    params[:workspace][:archiver] = current_user if params[:workspace][:archived] == 'true'
    workspace.attributes = params[:workspace]
    authorize! :update, workspace

    Workspace.transaction do
      if params[:workspace][:schema_name]
        begin
          workspace_sandbox = create_schema(params[:workspace][:schema_name], GpdbDatabase.find(params[:workspace][:database_id]))
        rescue Exception => e
          raise ApiValidationError.new(:schema, :generic, {:message => e.message})
        end
        workspace.sandbox = workspace_sandbox
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
      Events::WORKSPACE_ADD_SANDBOX.by(current_user).add(
          :sandbox_schema => workspace.sandbox,
          :workspace => workspace
      )
    end
  end

  def create_schema(name, database)
    if database.schemas.find_by_name(name)
      raise StandardError, "Schema #{name} already exists in database #{database.name}"
    end

    create_schema_in_gpdb(name, database)

    schema = GpdbSchema.new
    begin
      schema.name = name
      schema.database = database
      schema.save!
      schema
    rescue Exception => e
      cleanup_schema_in_gpdb(name, database)
      raise ApiValidationError.new(:schema, :generic, {:message => "Create schema #{name} command failed"})
    end
  end

  def create_schema_in_gpdb(name, database)
    database.with_gpdb_connection(database.instance.account_for_user!(current_user)) do |conn|
      sql = "CREATE SCHEMA #{conn.quote_column_name(name)}"
      conn.exec_query(sql)
    end
  rescue ActiveRecord::StatementInvalid => e
    raise ApiValidationError.new(:schema, :generic, {:message => "Create schema #{name} command failed"})
  end

  def cleanup_schema_in_gpdb(name, database)
    database.with_gpdb_connection(database.instance.account_for_user!(current_user)) do |conn|
      sql = "DROP SCHEMA IF EXISTS #{conn.quote_column_name(name)}"
      conn.exec_query(sql)
      return GpdbSchema.new
    end
  rescue ActiveRecord::StatementInvalid => e
    return GpdbSchema.new
  end
end

