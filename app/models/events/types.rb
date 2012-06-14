require_relative "base"

module Events
  class INSTANCE_CREATED < Base
    targets :instance
    activities :actor, :instance, :global
  end

  class INSTANCE_CHANGED_OWNER < Base
    targets :instance, :new_owner
    activities :instance, :new_owner, :global
  end
end

