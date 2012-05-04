namespace :legacy do
  DUMP_FILE_PATH = File.join(Rails.root, 'db', 'legacy', 'legacy.sql')
  POSTGRES_ARGS  = "--host=localhost --port=8543 --username=edcadmin"
  TEST_DB_NAME = "chorus_legacy_test"

  desc "Drop and recreate legacy test database, then import legacy data"
  task :setup => :environment do
    connection = User.connection
    [TEST_DB_NAME].each do |db_name|
      connection.execute "DROP DATABASE #{db_name}"
      connection.execute "CREATE DATABASE #{db_name}"
      system "psql #{POSTGRES_ARGS} #{db_name} < #{DUMP_FILE_PATH}"
    end
  end

  task :dump do
    system "pg_dump #{POSTGRES_ARGS} #{DEV_DB_NAME} > #{DUMP_FILE_PATH}"
  end

  desc "Migrate legacy data to the rails database"
  task :migrate => :environment do
    DataMigrator.migrate
  end
end

namespace :db do
  namespace :test do
    namespace :prepare do
      desc "Drop and recreate legacy test database, then import legacy data"
      task :legacy => "legacy:setup"
    end
  end
end

