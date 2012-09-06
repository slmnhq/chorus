class NotificationsController < ApplicationController
  def index
    events = current_user.notification_events.includes(:notification_for_current_user)
    events = events.where('read is false') if params['type'] == 'unread'
    present paginate(events), :presenter_options => {:read_receipts => true}
  end

  def read
    Notification.where(:event_id => params[:notification_ids],
                       :recipient_id => current_user.id).update_all(:read => true)
    head :ok
  end
end