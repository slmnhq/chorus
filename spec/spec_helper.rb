# This file is copied to spec/ when you run 'rails generate rspec:install'

HADOOP_TEST_INSTANCE = "chorus-gphd02.sf.pivotallabs.com"
ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../config/environment", __FILE__)
require 'sunspot_matchers'
require 'support/fixture_builder'
require 'rspec/rails'
require 'rspec/autorun'
require "paperclip/matchers"
require 'rspec_api_documentation'
require 'rspec_api_documentation/dsl'
require 'allowy/rspec'
require "vcr"
require "webmock/rspec"
require 'shoulda-matchers'

module Shoulda # :nodoc:
  module Matchers
    module ActiveModel # :nodoc:
      module Helpers
        def default_error_message(key, options = {})
          model_name = options.delete(:model_name)
          attribute = options.delete(:attribute)
          [key, options]
        end
      end
    end
  end
end

VCR.configure do |c|
  c.cassette_library_dir = 'spec/other_fixtures/vcr_cassettes'
  c.hook_into :webmock # or :fakeweb
end


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

  config.filter_run_excluding :legacy_migration => true

  # Remove this line if you're not using ActiveRecord or ActiveRecord fixtures
  config.fixture_path = "#{::Rails.root}/spec/fixtures"

  # If you're not using ActiveRecord, or you'd prefer not to run each of your
  # examples within a transaction, remove the following line or assign false
  # instead of true.
  config.use_transactional_fixtures = true

  config.before(:suite) do
    GpdbIntegration.drop_gpdb
  end

  config.before(:all) do
    self.class.set_fixture_class :events => Events::Base
    self.class.fixtures :all unless self.class.metadata[:legacy_migration]
  end

  # If true, the base class of anonymous controllers will be inferred
  # automatically. This will be the default behavior in future versions of
  # rspec-rails.
  config.infer_base_class_for_anonymous_controllers = true

  config.before do
    Sunspot.session = SunspotMatchers::SunspotSessionSpy.new(Sunspot.session)
  end

  config.after do
    Sunspot.session = Sunspot.session.original_session if Sunspot.session.is_a? SunspotMatchers::SunspotSessionSpy
  end

  config.before(:each, :legacy_migration => true) do
    # stub file reads of legacy workfiles
    #
    stub(File).read(/.+\/\d{5}\/[\d_]+$/) { "123" }
  end

  config.include FileHelper
  config.include FakeRelations
  config.include AuthHelper, :type => :controller
  config.include AcceptanceAuthHelper, :api_doc_dsl => :resource
  config.include RocketPants::TestHelper, :type => :controller
  config.include RocketPants::TestHelper, :type => :request
  config.include MockPresenters, :type => :controller
  config.include JsonHelper, :type => :controller
  config.include JsonHelper, :type => :request
  config.include FixtureGenerator, :type => :controller
  config.include Paperclip::Shoulda::Matchers
  config.include GpdbTestHelpers
  config.include AllowyRSpecHelpers
  config.include GpdbIntegration, :database_integration => true
  config.include LegacyMigrationHelper, :type => :legacy_migration
  config.include SunspotMatchers
  config.include SolrHelpers
end

