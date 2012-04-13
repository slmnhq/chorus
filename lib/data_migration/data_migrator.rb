class DataMigrator
  def self.migrate
    UserMigrator.migrate
  end
end