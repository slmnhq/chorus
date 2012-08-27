require 'events/base'

module Events
  class UserAdded < Base
    has_targets :new_user
    has_activities :actor, :new_user, :global
  end
end