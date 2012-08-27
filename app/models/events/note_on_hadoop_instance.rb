require 'events/note'

module Events
  class NoteOnHadoopInstance < Note
    has_targets :hadoop_instance
    has_activities :actor, :hadoop_instance, :global
  end
end