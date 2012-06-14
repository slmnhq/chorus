class Event < ActiveRecord::Base
  attr_accessible :action, :target1, :actor

  belongs_to :actor, :class_name => 'User'
  belongs_to :target1, :polymorphic => true

  after_create :create_activities

  def create_activities
    Activity.create!(:event => self, :entity => actor)
    Activity.create!(:event => self, :entity => target1)
    Activity.global.create!(:event => self)
  end

  def self.add(actor, action, target1)
    create!(:actor => actor, :action => action, :target1 => target1)
  end

end
