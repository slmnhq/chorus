class NotificationsController < ApplicationController
  def index
    events = current_user.notification_events
    events = events.where('read is false') if params['type'] == 'unread'
    present paginate(events)
  end

  def read
    Notification.where(:event_id => params[:notification_ids],
                       :recipient_id => current_user.id).update_all(:read => true)
    head :ok
  end
end