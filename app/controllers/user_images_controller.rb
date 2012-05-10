class UserImagesController < ImagesController
  protected

  def load_entity
    @entity = User.find(params[:id])
  end
end