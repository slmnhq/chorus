class WorkfileVersion < ActiveRecord::Base
  attr_accessible :commit_message
  has_attached_file :contents
  belongs_to :workfile
end
