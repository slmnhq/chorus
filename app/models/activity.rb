class Activity < ActiveRecord::Base
  attr_accessible :entity, :entity_type, :event

  belongs_to :entity, :polymorphic => true
  belongs_to :event, :class_name => 'Events::Base'

  default_scope { includes(:event).order("created_at DESC") }

  def self.global
    where(:entity_type => "GLOBAL")
  end

  def self.for_dashboard_of(user)
    memberships = Arel::Table.new("memberships")
    activities  = Arel::Table.new("activities")

    sql = activities.
      join(memberships, Arel::Nodes::OuterJoin).
      on(
        memberships[:user_id].eq(user.id).
        and(memberships[:workspace_id].eq(activities[:entity_id])).
        and(activities[:entity_type].eq("Workspace"))
      ).where(
        activities[:entity_type].eq("GLOBAL").
        or(memberships[:workspace_id].not_eq(nil))
      ).project(activities['*'])

    connection.select_all(sql).map { |row| allocate.init_with("attributes" => row) }
  end
end

