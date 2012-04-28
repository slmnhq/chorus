class DataMigrator
  attr_accessor :migrators

  def initialize
    @migrators = [LdapConfigMigrator.new, UserMigrator.new, InstanceMigrator.new, InstanceCredentialMigrator.new]
  end

  def migrate
    @migrators.each do |migrator|
      migrator.migrate
    end
  end
end