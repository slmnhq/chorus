class DatabaseMigrationRefreshExport
  def self.export
    unless Rails.env.test?
      raise "MUST BE RUN UNDER TEST ENV"
    end

    User.transaction do
      Legacy.transaction do
        UserMigrator.new.migrate
        InstanceMigrator.new.migrate
        InstanceAccountMigrator.new.migrate
        DatabaseMigrator.new.migrate

        self.dump_class(GpdbDatabase, Rails.root + 'spec/fixtures/database_migration_refresh/gpdb_database.yml' )
        self.dump_class(GpdbSchema, Rails.root + 'spec/fixtures/refresh/gpdb_schema.yml' )
        self.dump_class(Dataset, Rails.root + 'spec/fixtures/refresh/dataset.yml' )

        raise ActiveRecord::Rollback
      end
      raise ActiveRecord::Rollback
    end
  end

  def self.dump_class(klass, file_name)
    record_number = 0
    fixture_data = klass.all.collect(&:attributes).inject({}) do |hash, record|
      hash[record_number+=1] = record
      hash
    end

    File.open(file_name, 'w') do |file|
      file.write fixture_data.to_yaml
    end
  end
end