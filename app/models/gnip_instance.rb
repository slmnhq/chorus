class GnipInstance < ActiveRecord::Base
  attr_accessible :name, :host, :port, :description, :username, :password, :owner

  validates_presence_of :name, :host, :port, :username, :password, :owner

  belongs_to :owner, :class_name => 'User'
end