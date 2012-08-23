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
  end
end
