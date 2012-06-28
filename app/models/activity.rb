class Activity < ActiveRecord::Base
  GLOBAL = "GLOBAL"

  attr_accessible :entity, :entity_type, :event
  belongs_to :entity, :polymorphic => true
  belongs_to :event, :class_name => 'Events::Base'

  def self.global
    where(:entity_type => GLOBAL)
  end
end
