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
    `cd #{Rails.root} && RAILS_ENV=test packaging/legacy_migrate_schema_setup.sh db/legacy/legacy.sql`
  end

  config.after(:suite) do
    #`psql -p 8543 chorus_rails_test -c 'drop schema if exists legacy_migrate cascade'`
  end

  config.include FileHelper
  config.include FakeRelations
end
