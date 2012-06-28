class InstanceAccount < ActiveRecord::Base
  attr_accessible :db_username, :db_password
  validates_presence_of :db_username, :db_password, :instance_id, :owner_id
  validates_length_of :db_password, :minimum => 6, :maximum => 256, :if => :db_password

  belongs_to :owner, :class_name => 'User'
  belongs_to :instance
end
