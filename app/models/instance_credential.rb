class InstanceCredential < ActiveRecord::Base
  attr_accessible :username, :password

  belongs_to :owner, :class_name => 'User'
  belongs_to :instance
end