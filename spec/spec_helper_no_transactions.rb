# This file is copied to spec/ when you run 'rails generate rspec:install'

HADOOP_TEST_INSTANCE = "chorus-gphd02.sf.pivotallabs.com"
ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'rspec/rails'
require 'rspec/autorun'
require "paperclip/matchers"
require 'allowy/rspec'
require 'shoulda-matchers'

# Requires supporting ruby files with custom matchers and macros, etc,
# in spec/support/ and its subdirectories.
Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f }
require_relative "factories"

RSpec.configure do |config|
  # ## Mock Framework
  #
  # If you prefer to use mocha, flexmock or RR, uncomment the appropriate line:
  #
  # config.mock_with :mocha
  # config.mock_with :flexmock
  config.mock_with :rr


  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  config.use_transactional_fixtures = false

  config.treat_symbols_as_metadata_keys_with_true_values = true


  Chorus::Application.configure do |config|
    config.config.legacy_chorus_root_path = Rails.root + "system/legacy_workfiles"
  end

  config.include FileHelper
  config.include FakeRelations
  config.include JsonHelper, :type => :controller
  config.include JsonHelper, :type => :request
  config.include FixtureGenerator, :type => :controller
  config.include Paperclip::Shoulda::Matchers
  config.include GpdbTestHelpers
  config.include AllowyRSpecHelpers
end

