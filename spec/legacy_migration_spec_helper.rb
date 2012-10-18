ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'rspec/autorun'
require "paperclip/matchers"
require 'shoulda-matchers'
require 'database_cleaner'

DatabaseCleaner.strategy = :truncation



SPEC_WORKFILE_PATH = Rails.root + "system/legacy_workfiles"

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f unless f.match /fixture_builder/ }

RSpec.configure do |config|
  config.mock_with :rr

  config.before(:suite) do
    DatabaseCleaner.clean

    def legacy_sql_md5
      '4a52ced182ab9a7aa14a31704bc122c8'
    end

    unless File.exist?("db/legacy/legacy_#{legacy_sql_md5}.sql")
      p "Downloading legacy dump from server"
      FileUtils.mkdir_p('db/legacy')
      `wget  -O db/legacy/legacy_#{legacy_sql_md5}.sql http://greenplum-ci/~ci/legacy_#{legacy_sql_md5}.sql`
    end
    `cd #{Rails.root} && RAILS_ENV=test spec/legacy_migrate_schema_setup.sh db/legacy/legacy_#{legacy_sql_md5}.sql`
  end

  config.after(:suite) do
    #`psql -p 8543 chorus_rails_test -c 'drop schema if exists legacy_migrate cascade'`
  end

  config.include FileHelper
  config.include FakeRelations
end
