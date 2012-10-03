class Comment < ActiveRecord::Base
  include SoftDelete
  include Recent

  attr_accessible :author_id, :text, :event_id
  belongs_to :event, :class_name => 'Events::Base'
  belongs_to :author, :class_name => 'User'

  validates_presence_of :author_id, :text, :event_id
end
