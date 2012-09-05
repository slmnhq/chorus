class DataMigrator

  # Only need to call the leaf nodes
  def self.migrate_all(workfile_path)
    options = {'workfile_path' => workfile_path}

    InstanceAccountMigrator.migrate
    ImageMigrator.migrate
    SandboxMigrator.migrate
    AssociatedDatasetMigrator.migrate
    ActivityMigrator.migrate(options)
    NoteAttachmentMigrator.migrate(options)
    NotificationMigrator.migrate(options)

    # Note attachments
    # Note comments


    ActivityMigrator.validate
    AssociatedDatasetMigrator.validate
    DatabaseObjectMigrator.validate
    HadoopInstanceMigrator.validate
    HdfsEntryMigrator.validate
    InstanceAccountMigrator.validate
    InstanceMigrator.validate
    MembershipMigrator.validate
    NoteAttachmentMigrator.validate
    NoteMigrator.validate
    NotificationMigrator.validate
    UserMigrator.validate
    WorkfileMigrator.validate
    WorkspaceMigrator.validate
  end
end
