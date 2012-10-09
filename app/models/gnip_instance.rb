class GnipInstance < ActiveRecord::Base
  attr_accessible :name, :host, :port, :description, :username, :password, :owner_id

  validates_presence_of :name, :host, :port, :username, :password, :owner_id
end