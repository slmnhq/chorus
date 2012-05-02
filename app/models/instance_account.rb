class InstanceAccount < ActiveRecord::Base
  set_table_name :instance_credentials

  attr_accessible :username, :password
  validates_presence_of :instance, :owner

  belongs_to :owner, :class_name => 'User'
  belongs_to :instance
end