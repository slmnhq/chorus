class Instance < ActiveRecord::Base
  attr_protected :id
  attr_accessor :db_username, :db_password

  validates_presence_of :name, :port, :host, :maintenance_db
end