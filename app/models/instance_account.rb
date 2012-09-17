class InstanceAccount < ActiveRecord::Base
  attr_accessible :db_username, :db_password
  validates_presence_of :db_username, :db_password, :gpdb_instance_id, :owner_id

  attr_encrypted :db_password, :encryptor => ChorusEncryptor, :encrypt_method => :encrypt_password, :decrypt_method => :decrypt_password, :encode => false

  belongs_to :owner, :class_name => 'User'
  belongs_to :gpdb_instance
  has_and_belongs_to_many :gpdb_databases
end
