class DataMigrator

  # Only need to call the leaf nodes
  def self.migrate_all
    InstanceAccountMigrator.new.migrate
    ImageMigrator.new.migrate
    SandboxMigrator.new.migrate
    AssociatedDatasetMigrator.new.migrate
    ActivityMigrator.new.migrate

    # Note attachments
    # Note comments
  end
end
