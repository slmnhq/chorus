class CommentsController < ApplicationController

  def show
    comment = Comment.find(params[:id])
    authorize! :show, comment
    present comment
  end

  def create
    comment = Comment.new
    attributes = params[:comment]
    attributes[:author_id] = current_user.id
    comment.attributes = attributes

    authorize! :create_comment_on, Comment, Events::Base.find(comment.event_id)
    comment.save!

    event_id = comment.event_id
    event = Events::Base.find(event_id)
    users_to_notify = event.comments.map(&:author_id)
    users_to_notify << event.actor_id
    users_to_notify = users_to_notify.uniq - [current_user.id]
    users_to_notify.each do |user_id|
      Notification.create!(
          :recipient_id => user_id,
          :event_id => event_id
      )
    end

    present comment, :status => :created
  end

  def destroy
    comment = Comment.find(params[:id])
    authorize! :destroy, comment

    comment.destroy
    render :json => {}
  end
end