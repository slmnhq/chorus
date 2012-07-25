class InstanceAccount < ActiveRecord::Base
  attr_accessible :db_username, :db_password
  validates_presence_of :db_username, :db_password, :instance_id, :owner_id

  belongs_to :owner, :class_name => 'User'
  belongs_to :instance
  has_and_belongs_to_many :gpdb_databases
end
