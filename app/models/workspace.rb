class Workspace < ActiveRecord::Base
  belongs_to :archiver, :class_name => 'User'
  belongs_to :owner, :class_name => 'User'

  validates_presence_of :name
end