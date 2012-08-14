class DataMigrator
  attr_accessor :migrators

  def initialize
    @migrators = [ConfigMigrator.new,
                  UserMigrator.new, #done
                  InstanceMigrator.new, #done
                  InstanceAccountMigrator.new, # done
                  WorkspaceMigrator.new, #done
                  MembershipMigrator.new, #done
                  ImageMigrator.new,
                  WorkfileMigrator.new,
                  SandboxMigrator.new,
                  HadoopInstanceMigrator.new, # done
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
