require_relative "base"

module Events
  class INSTANCE_CREATED < Base
    has_targets :instance
    has_activities :actor, :instance, :global
  end

  class INSTANCE_CHANGED_OWNER < Base
    has_targets :instance, :new_owner
    has_activities :instance, :new_owner, :global
  end
end
