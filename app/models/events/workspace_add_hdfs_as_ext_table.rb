require 'events/base'

module Events
  class WorkspaceAddHdfsAsExtTable < Base
    has_targets :dataset, :hdfs_file, :workspace
    has_activities :actor, :workspace, :dataset, :hdfs_file, :global
  end
end