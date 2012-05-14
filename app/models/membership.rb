class Membership < ActiveRecord::Base
  belongs_to :user
  belongs_to :workspace
  validates_presence_of :user
  validates_presence_of :workspace
  attr_accessible :user, :workspace
end
