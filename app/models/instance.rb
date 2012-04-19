class Instance < ActiveRecord::Base
  attr_protected :id
  attr_accessor :db_username, :db_password
end