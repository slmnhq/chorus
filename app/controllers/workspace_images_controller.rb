class WorkspaceImagesController < ImagesController

  protected

  def load_entity
    @entity = Workspace.find(params[:workspace_id])
  end
end
