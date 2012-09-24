require 'json_hash_serializer'

module Events
  class Base < ActiveRecord::Base
    include SoftDelete

    self.table_name = :events
    self.inheritance_column = :action
    serialize :additional_data, JsonHashSerializer

    class_attribute :entities_that_get_activities, :target_names, :object_translations
    attr_accessible :actor, :action, :target1, :target2, :workspace, :additional_data

    has_many :activities, :foreign_key => :event_id, :dependent => :destroy
    has_many :notifications
    has_one :notification_for_current_user, :class_name => 'Notification', :conditions => proc {
      "recipient_id = #{ActiveRecord::Base.current_user.id}"
    }, :foreign_key => :event_id

    has_many :comments, :foreign_key => :event_id

    # subclass associations on parent to facilitate .includes
    has_many :attachments, :class_name => 'NoteAttachment', :foreign_key => 'note_id'
    has_many :notes_workfiles, :foreign_key => 'note_id'
    has_many :workfiles, :through => :notes_workfiles
    has_many :datasets_notes, :foreign_key => 'note_id'
    has_many :datasets, :through => :datasets_notes

    belongs_to :actor, :class_name => 'User'
    belongs_to :target1, :polymorphic => true
    belongs_to :target2, :polymorphic => true
    belongs_to :workspace

    [:actor, :workspace, :target1, :target2].each do |method|
      define_method("#{method}_with_deleted") do
        original_method = :"#{method}_without_deleted"
        send(original_method) || try_unscoped(method) { send(original_method, true) }
      end
      alias_method_chain method, :deleted
    end

    default_scope { order("id DESC") }

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
      activities = Activity.arel_table

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
      event_ids = ActiveRecord::Base.connection.execute(dashboard_activities.project(:event_id).to_sql).map { |h| h['event_id'] }
      where(:id => event_ids)
    end

    def create_activities
      self.class.entities_that_get_activities.each do |entity_name|
        create_activity(entity_name)
      end
    end

    def additional_data_key(additional_data_key)
      self.class.object_translations.fetch(additional_data_key.to_s, additional_data_key)
    end

    def additional_data_value(additional_data_key)
      send(additional_data_key(additional_data_key))
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
      options = target_names.extract_options!
      self.target_names = target_names
      self.attr_accessible(*target_names)

      target_names.each_with_index do |name, i|
        alias_getter_and_setter("target#{i+1}", name, options)
      end

      alias_method("primary_target", target_names.first)
    end

    def self.alias_getter_and_setter(existing_name, new_name, options)
      # The events table has a dedicated 'workspace_id' column,
      # so we don't alias :workspace to :target1 or :target2.
      # Subclasses should still specify the workspace as
      # a target if they need the workspace to be included
      # in their JSON representation.
      return if new_name == :workspace

      alias_method("#{new_name}=", "#{existing_name}=")
      alias_method(new_name, existing_name)
    end

    def self.has_activities(*entity_names)
      self.entities_that_get_activities = entity_names
    end

    def self.has_additional_data(*names)
      attr_accessible(*names)
      names.each do |name|
        define_method(name) { additional_data[name.to_s] }
        define_method("#{name}=") { |value| additional_data[name.to_s] = value }
      end
    end

    def self.translate_additional_data_ids(args={})
      self.object_translations ||= {}
      args.each do |key_value|
        wrapper_name = key_value.first
        wrapper_type = key_value.last
        wrapped_id = "#{wrapper_name}_id"

        object_translations[wrapped_id.to_s] = wrapper_name

        attr_accessible wrapper_name

        define_method(wrapper_name) { wrapper_type.find_by_id(send(wrapped_id)) }
        define_method("#{wrapper_name}=") { |value| send("#{wrapped_id}=", value.present? ? value.id : nil) }
      end
    end

    private

    def try_unscoped(method, &block)
      type = target_class(method).try(:unscoped,&block)
    end

    def target_class(method)
      case method
        when :actor then User
        when :workspace then Workspace
        else
          type = try(:"#{method}_type")
          type.constantize if type
      end
    end
  end
end
