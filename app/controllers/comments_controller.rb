class CommentsController < ApplicationController

  def show
    comment = Comment.find(params[:id])
    authorize! :show, comment
    present comment
  end

  def create
    comment = Comment.new
    attributes = params[:comment]
    attributes[:author_id] = current_user[:id]
    comment.attributes = attributes

    authorize! :create_comment_on, Comment, Events::Base.find(comment.event_id)
    comment.save!

    present comment, :status => :created
  end

  def destroy
    comment = Comment.find(params[:id])
    authorize! :destroy, comment

    comment.destroy
    render :json => {}
  end
end