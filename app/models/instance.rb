class Instance < ActiveRecord::Base
  attr_accessible :name, :description, :host, :port, :maintenance_db

  validates_presence_of :name, :host, :port, :maintenance_db

  belongs_to :owner, :class_name => 'User'
  has_many :credentials, :class_name => 'InstanceCredential'

  def owner_credentials
    credentials.where(:owner_id => owner_id).first
  end
end