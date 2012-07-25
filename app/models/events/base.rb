module Events
  class Base < ActiveRecord::Base
    include SoftDelete

    self.table_name = :events
    self.inheritance_column = :action
    serialize :additional_data, Hash

    class_attribute :entities_that_get_activities, :target_names
    attr_accessible :actor, :action, :target1, :target2, :workspace, :additional_data

    has_many :activities, :foreign_key => :event_id
    belongs_to :actor, :class_name => 'User'
    belongs_to :target1, :polymorphic => true
    belongs_to :target2, :polymorphic => true
    belongs_to :workspace

    default_scope { order("id DESC") }

    after_destroy :destroy_activities

    def destroy_activities
      activities.destroy_all
    end

    def self.by(actor)
      where(:actor_id => actor.id)
    end

    def self.add(params)
      create!(params).tap { |event| event.create_activities }
    end

    def action
      self.class.name.demodulize
    end

    def targets
      self.class.target_names.reduce({}) do |hash, target_name|
        hash[target_name] = send(target_name)
        hash
      end
    end

    def self.for_dashboard_of(user)
      memberships = Membership.arel_table
      activities  = Activity.arel_table

      workspace_ids =
        memberships.
        where(memberships[:user_id].eq(user.id)).
        project(memberships[:workspace_id])
      entity_is_global =
        activities[:entity_type].eq(Activity::GLOBAL)

      entity_in_user_workspaces =
        activities[:entity_type].eq("Workspace").
        and(activities[:entity_id].in(workspace_ids))

      dashboard_activities = activities.where(entity_is_global.or(entity_in_user_workspaces))

      where(:id => dashboard_activities.project(:event_id))
    end

    def create_activities
      self.class.entities_that_get_activities.each do |entity_name|
        create_activity(entity_name)
      end
    end

    private

    def create_activity(entity_name)
      if entity_name == :global
        Activity.global.create!(:event => self)
      else
        entity = send(entity_name)
        Activity.create!(:event => self, :entity => entity)
      end
    end

    def self.has_targets(*target_names)
      self.target_names = target_names.compact
      self.attr_accessible(*target_names)

      target_names.each_with_index do |name, i|
        alias_getter_and_setter("target#{i+1}", name)
      end
    end

    def self.alias_getter_and_setter(existing_name, new_name)
      return unless new_name

      # The events table has a dedicated 'workspace_id' column,
      # so we don't alias :workspace to :target1 or :target2.
      # Subclasses should still specify the workspace as
      # a target if they need the workspace to be included
      # in their JSON representation.
      return if new_name == :workspace

      alias_method(new_name, existing_name)
      alias_method("#{new_name}=", "#{existing_name}=")
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

