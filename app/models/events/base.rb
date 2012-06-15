module Events
  class Base < ActiveRecord::Base
    self.table_name = :events
    self.inheritance_column = :action

    serialize :additional_data, Hash

    class_attribute :entities_that_get_activities, :target_names
    attr_accessible :action, :target1, :target2, :actor, :additional_data

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

    def targets
      self.class.target_names.reduce({}) do |hash, target_name|
        hash[target_name] = send(target_name)
        hash
      end
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

    def self.has_targets(target1_name, target2_name = nil)
      self.target_names = [target1_name, target2_name].compact
      self.attr_accessible target1_name, target2_name

      alias_method(target1_name, :target1)
      alias_method("#{target1_name}=", :target1=)

      if target2_name
        alias_method(target2_name, :target2)
        alias_method("#{target2_name}=", :target2=)
      end
    end

    def self.has_activities(*entity_names)
      self.entities_that_get_activities = entity_names
    end

    def self.has_additional_data(*names)
      attr_accessible(*names)
      names.each do |name|
        define_method(name) { additional_data[name] }
        define_method("#{name}=") { |value| additional_data[name] = value }
      end
    end
  end
end

