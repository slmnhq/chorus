class DataMigrator
  def self.migrate
    LdapConfigMigrator.migrate
    UserMigrator.migrate
    InstanceMigrator.migrate
    InstanceCredentialMigrator.migrate
  end
end