class Instance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db, :shared, :provision_type, :description, :instance_provider

  validates_presence_of :name, :host, :port, :maintenance_db

  belongs_to :owner, :class_name => 'User'
  has_many :accounts, :class_name => 'InstanceAccount'

  def owner_account
    accounts.where(:owner_id => owner_id).first
  end

  def get_instance_provider
    return "Greenplum Database"
  end
end