class Workfile < ActiveRecord::Base
  attr_accessible :description

  belongs_to :workspace
  belongs_to :owner, :class_name => 'User'

  has_many :versions, :class_name => 'WorkfileVersion'
end
