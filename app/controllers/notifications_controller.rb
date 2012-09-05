class NotificationsController < ApplicationController
  def index
    present paginate(current_user.notification_events)
  end

  def read
    Notification.where(:id => params[:notification_ids]).update_all(:read => true)
    head :ok
  end
end