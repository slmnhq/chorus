ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'rspec/autorun'
require "paperclip/matchers"
require 'shoulda-matchers'
require 'database_cleaner'

DatabaseCleaner.strategy = :truncation

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }

RSpec.configure do |config|
  config.mock_with :rr

  config.before(:suite) do
    DatabaseCleaner.clean
    `cd #{Rails.root} && RAILS_ENV=test packaging/chorus_migrate.sh db/legacy/legacy.sql`
  end

  Chorus::Application.configure do |config|
    config.config.legacy_chorus_root_path = Rails.root + "system/legacy_workfiles"
  end

  config.include FileHelper
  config.include FakeRelations
end
