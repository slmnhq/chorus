require 'events/base'

module Events
  class GnipInstanceCreated < Base
    has_targets :gnip_instance
    has_activities :actor, :gnip_instance, :global
  end
end