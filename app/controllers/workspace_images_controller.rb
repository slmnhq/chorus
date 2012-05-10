class WorkspaceImagesController < ImagesController

  protected

  def load_entity
    @entity = Workspace.find(params[:id])
  end
end