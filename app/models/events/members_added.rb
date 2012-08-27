require 'events/base'

module Events
  class MembersAdded < Base
    has_targets :member, :workspace
    has_activities :actor, :workspace
    has_additional_data :num_added
  end
end