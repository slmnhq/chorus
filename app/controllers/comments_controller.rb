class CommentsController < ApplicationController

  def show
    present @comment
  end

  def create
    comment = Comment.new

    attributes = params[:comment]
    attributes[:author_id] = current_user[:id]
    attributes[:event_id] = params[:comment][:event]
    comment.attributes = attributes

    comment.save!

    present comment, :status => :created
  end
end