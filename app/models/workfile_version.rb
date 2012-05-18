class WorkfileVersion < ActiveRecord::Base
  attr_accessible :commit_message
  has_attached_file :contents
  belongs_to :workfile
  belongs_to :owner, :class_name => 'User'
  belongs_to :modifier, :class_name => 'User'
end
