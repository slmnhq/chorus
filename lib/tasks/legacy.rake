namespace :legacy do
  DUMP_FILE_PATH = File.join(Rails.root, 'db', 'legacy', 'legacy.sql')
  POSTGRES_ARGS = "--host=127.0.0.1 --port=8543 --username=edcadmin"
  TEST_DB_NAME = "chorus_legacy_test"

  desc "Drop and recreate legacy test database, then import legacy data"
  task :setup => :environment do
    connection = User.connection
    connection.execute "DROP DATABASE IF EXISTS #{TEST_DB_NAME}"
    connection.execute "CREATE DATABASE #{TEST_DB_NAME}"
    system "psql #{POSTGRES_ARGS} #{TEST_DB_NAME} < #{DUMP_FILE_PATH} > /dev/null"
  end

  task :dump do
    system "pg_dump #{POSTGRES_ARGS} #{DEV_DB_NAME} > #{DUMP_FILE_PATH}"
  end

  desc "Migrate legacy data to the rails database"
  task :migrate => :environment do
    DataMigrator.new.migrate
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

