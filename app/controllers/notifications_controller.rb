class NotificationsController < ApplicationController
  def index
    present current_user.notification_events
  end
end