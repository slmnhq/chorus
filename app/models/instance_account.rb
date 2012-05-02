class InstanceAccount < ActiveRecord::Base

  attr_accessible :username, :password, :owner_id
  validates_presence_of :instance, :owner

  belongs_to :owner, :class_name => 'User'
  belongs_to :instance
end