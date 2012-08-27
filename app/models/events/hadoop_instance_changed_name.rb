require 'events/base'

module Events
  class HadoopInstanceChangedName < Base
    has_targets :hadoop_instance
    has_additional_data :old_name, :new_name
    has_activities :actor, :hadoop_instance, :global
  end
end

