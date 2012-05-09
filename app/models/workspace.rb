class Workspace < ActiveRecord::Base
  attr_accessible :name, :public, :summary

  belongs_to :archiver, :class_name => 'User'
  belongs_to :owner, :class_name => 'User'

  validates_presence_of :name

  scope :active, where(:archived_at => nil)
end