namespace :legacy do
  desc "Migrate legacy data to the rails database"
  task :migrate => :environment do
    DataMigrator.migrate_all ENV['WORKFILE_PATH']
  end
end
