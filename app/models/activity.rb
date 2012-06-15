class Activity < ActiveRecord::Base
  attr_accessible :entity, :entity_type, :event

  belongs_to :entity, :polymorphic => true
  belongs_to :event, :class_name => 'Events::Base'

  default_scope { includes(:event).order("created_at DESC") }

  def self.global
    where(:entity_type => "GLOBAL")
  end
end

