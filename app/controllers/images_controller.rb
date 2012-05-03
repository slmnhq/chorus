class ImagesController < ApplicationController
  before_filter :load_user

  def update
    @user.image = params[:files][0]
    @user.save!
    present @user.image
  end

  private

  def load_user
    @user = User.find(params[:id])
  end
end
