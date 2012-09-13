class Comment < ActiveRecord::Base
  attr_accessible :author_id, :body, :event_id
  belongs_to :event, :class_name => 'Events::Base'
  belongs_to :author, :class_name => 'User'

  validates_presence_of :author_id, :body, :event_id
end
