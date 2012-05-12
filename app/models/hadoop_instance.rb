class HadoopInstance < ActiveRecord::Base
  attr_accessible :name, :host, :port, :description, :username, :group_list
  belongs_to :owner, :class_name => 'User'
  validates_presence_of :name, :host, :port
end
