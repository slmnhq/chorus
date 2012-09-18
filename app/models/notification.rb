class Notification < ActiveRecord::Base
  attr_accessible :event_id, :recipient_id

  belongs_to :recipient, :class_name => 'User', :foreign_key => 'recipient_id'
  belongs_to :notification_event, :class_name => 'Events::Base', :foreign_key => 'event_id'
end