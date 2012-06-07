class Event < ActiveRecord::Base
  attr_accessible :action, :object, :actor

  belongs_to :actor, :class_name => 'User'
  belongs_to :object, :polymorphic => true

  after_create :create_activities

  def create_activities
    Activity.create!(:event => self, :entity => actor)
    Activity.create!(:event => self, :entity => object)
    Activity.global.create!(:event => self)
  end
end