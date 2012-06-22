class Activity < ActiveRecord::Base
  attr_accessible :entity, :entity_type, :event

  belongs_to :entity, :polymorphic => true
  belongs_to :event, :class_name => 'Events::Base'

  default_scope { includes(:event).order("activities.created_at DESC") }

  def self.global
    where(:entity_type => "GLOBAL")
  end

  def self.for_dashboard_of(user)
    memberships = Membership.arel_table
    activities  = Activity.arel_table

    workspace_ids =
      memberships.
      where(memberships[:user_id].eq(user.id)).
      project(memberships[:workspace_id])

    entity_is_global =
      activities[:entity_type].eq("GLOBAL")

    entity_in_user_workspaces =
      activities[:entity_type].eq("Workspace").
      and(activities[:entity_id].in(workspace_ids))

    where(entity_is_global.or(entity_in_user_workspaces))
  end
end

