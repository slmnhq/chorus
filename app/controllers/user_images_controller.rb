class UserImagesController < ImagesController
  protected

  def load_entity
    @entity = User.find(params[:user_id])
  end
end
