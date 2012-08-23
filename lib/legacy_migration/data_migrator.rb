class DataMigrator

  # Only need to call the leaf nodes
  def self.migrate_all
    InstanceAccountMigrator.migrate
    ImageMigrator.migrate
    SandboxMigrator.migrate
    AssociatedDatasetMigrator.migrate
    ActivityMigrator.migrate
    NoteMigrator.migrate

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
    UserMigrator.validate
    WorkfileMigrator.validate
    WorkspaceMigrator.validate
  end
end
