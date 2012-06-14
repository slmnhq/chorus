module Events
  class Base < ActiveRecord::Base
    self.table_name = :events
    self.inheritance_column = :action

    class_attribute :entities_that_get_activities
    attr_accessible :action, :target1, :target2, :actor

    belongs_to :actor, :class_name => 'User'
    belongs_to :target1, :polymorphic => true
    belongs_to :target2, :polymorphic => true

    after_create :create_activities

    def self.by(actor)
      where(:actor_id => actor.id)
    end

    def self.add(params)
      create!(params)
    end

    def action
      read_attribute(:action).split("::").last
    end

    private

    def create_activities
      self.class.entities_that_get_activities.each do |entity_name|
        create_activity(entity_name)
      end
    end

    def create_activity(entity_name)
      if entity_name == :global
        Activity.global.create!(:event => self)
      else
        entity = send(entity_name)
        Activity.create!(:event => self, :entity => entity)
      end
    end

    def self.targets(target1_name, target2_name = nil)
      self.attr_accessible target1_name
      alias_method(target1_name, :target1)
      alias_method("#{target1_name}=", :target1=)
      if target2_name
        self.attr_accessible target2_name
        alias_method(target2_name, :target2)
        alias_method("#{target2_name}=", :target2=)
      end
    end

    def self.activities(*entity_names)
      self.entities_that_get_activities = entity_names
    end

    activities :actor, :global
  end
end
