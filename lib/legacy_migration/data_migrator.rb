class DataMigrator
  attr_accessor :migrators

  def initialize
    @migrators = [ConfigMigrator.new,
                  UserMigrator.new,
                  InstanceMigrator.new,
                  InstanceAccountMigrator.new,
                  WorkspaceMigrator.new,
                  MembershipMigrator.new,
                  ImageMigrator.new,
                  WorkfileMigrator.new,
                  SandboxMigrator.new,
                  HadoopInstanceMigrator.new,
                  #ActivityMigrator.new,
                  AssociatedDatasetMigrator.new
                 ]
  end

  def migrate
    disable_solr
    ActiveRecord::Base.transaction do
      @migrators.each do |migrator|
        migrator.migrate
      end
    end
  end

  def disable_solr
    Sunspot.session = Sunspot::Rails::StubSessionProxy.new(Sunspot.session)
  end
end
