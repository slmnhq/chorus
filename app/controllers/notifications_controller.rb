class NotificationsController < ApplicationController
  def index
    notifications = current_user.notifications.order("created_at DESC")
    notifications = notifications.unread if params['type'] == 'unread'
    present paginate(notifications)
  end

  def read
    Notification.where(:id => params[:notification_ids]).update_all(:read => true)
    head :ok
  end
end