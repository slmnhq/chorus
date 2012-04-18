class DataMigrator
  def self.migrate
    UserMigrator.migrate
    InstanceMigrator.migrate
  end
end