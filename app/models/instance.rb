class Instance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db

  validates_presence_of :name, :host, :port, :maintenance_db

  belongs_to :owner, :class_name => 'User'
end