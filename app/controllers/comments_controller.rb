class CommentsController < ApplicationController

  def show
    comment = Comment.find(params[:id])
    present comment
  end

  def create
    comment = Comment.new

    attributes = params[:comment]
    attributes[:author_id] = current_user[:id]
    comment.attributes = attributes

    comment.save!

    present comment, :status => :created
  end
end