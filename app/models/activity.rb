class Activity < ActiveRecord::Base
  attr_accessible :entity, :entity_type, :event

  belongs_to :entity, :polymorphic => true
  belongs_to :event, :class_name => 'Event'

  default_scope includes(:event)
  delegate :actor, :actor=, :action, :action=, :target, :target=, :to => :event

  def self.global
    where(:entity_type => "GLOBAL")
  end
end
