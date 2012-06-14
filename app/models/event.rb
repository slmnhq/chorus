class Event < ActiveRecord::Base
  inheritance_column = :action
  attr_accessible :action, :target1, :actor

  belongs_to :actor, :class_name => 'User'
  belongs_to :target1, :polymorphic => true

  after_create :create_activities

  def create_activities
    Activity.create!(:event => self, :entity => actor)
    Activity.create!(:event => self, :entity => target1)
    Activity.global.create!(:event => self)
  end

  def self.add(actor, target1)
    create!(:actor => actor, :target1 => target1)
  end

  class INSTANCE_CREATED < Event
  end

end
