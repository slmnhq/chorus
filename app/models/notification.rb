class Notification < ActiveRecord::Base
  include SoftDelete
  attr_accessible :event_id, :recipient_id, :comment_id

  belongs_to :recipient, :class_name => 'User', :foreign_key => 'recipient_id'
  belongs_to :notification_event, :class_name => 'Events::Base', :foreign_key => 'event_id' #change name?
  belongs_to :comment

  validates_presence_of :recipient_id, :event_id

  scope :unread, where(:read => false)
end