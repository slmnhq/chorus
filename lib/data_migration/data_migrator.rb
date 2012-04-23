class DataMigrator
  def self.migrate
    UserMigrator.migrate
    InstanceMigrator.migrate
    InstanceCredentialMigrator.migrate
  end
end