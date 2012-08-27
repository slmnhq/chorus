require 'events/base'

module Events
  class HadoopInstanceCreated < Base
    has_targets :hadoop_instance
    has_activities :actor, :hadoop_instance, :global
  end
end