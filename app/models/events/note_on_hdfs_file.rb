module Events
  class NoteOnHdfsFile < Note
    has_targets :hdfs_file
    has_activities :actor, :hdfs_file, :global
  end
end