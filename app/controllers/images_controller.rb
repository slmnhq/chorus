class ImagesController < ApplicationController
  before_filter :load_entity

  def update
    @entity.image = params[:files][0]
    @entity.save!
    present @entity.image
  end

  protected
  def load_entity
    raise  NotImplementedError, "Method Not implemented"
  end
end
