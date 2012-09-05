class NotificationsController < ApplicationController
  def index
    present paginate(current_user.notification_events)
  end
end