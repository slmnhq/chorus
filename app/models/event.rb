class Event < ActiveRecord::Base
  attr_accessible :action, :target, :actor

  belongs_to :actor, :class_name => 'User'
  belongs_to :target, :polymorphic => true

  after_create :create_activities

  def create_activities
    Activity.create!(:event => self, :entity => actor)
    Activity.create!(:event => self, :entity => target)
    Activity.global.create!(:event => self)
  end

  def self.for_target(target)
    where(:target_id => target.id, :target_type => target.class.name)
  end

  def self.add(actor, action, target)
    create!(:actor => actor, :action => action, :target => target)
  end
end
