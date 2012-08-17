require 'rubygems'
require 'spork'
#uncomment the following line to use spork with the debugger
#require 'spork/ext/ruby-debug'

Spork.prefork do
  HADOOP_TEST_INSTANCE = "chorus-gphd02.sf.pivotallabs.com"
  ENV["RAILS_ENV"] ||= 'test'
  require File.expand_path("../../config/environment", __FILE__)
  require 'sunspot_matchers'
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
    c.default_cassette_options = { :record => :new_episodes }
  end


  # Requires supporting ruby files with custom matchers and macros, etc,
  # in spec/support/ and its subdirectories.
  Dir[Rails.root.join("spec/support/**/*.rb")].each { |f| require f unless f.match /fixture_builder/ }
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

    config.treat_symbols_as_metadata_keys_with_true_values = true

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

    Chorus::Application.configure do |config|
      config.config.legacy_chorus_root_path = Rails.root + "system/legacy_workfiles"
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
    config.include SunspotMatchers
    config.include SolrHelpers
  end


end

Spork.each_run do
  require 'support/fixture_builder'
end

# --- Instructions ---
# Sort the contents of this file into a Spork.prefork and a Spork.each_run
# block.
#
# The Spork.prefork block is run only once when the spork server is started.
# You typically want to place most of your (slow) initializer code in here, in
# particular, require'ing any 3rd-party gems that you don't normally modify
# during development.
#
# The Spork.each_run block is run each time you run your specs.  In case you
# need to load files that tend to change during development, require them here.
# With Rails, your application modules are loaded automatically, so sometimes
# this block can remain empty.
#
# Note: You can modify files loaded *from* the Spork.each_run block without
# restarting the spork server.  However, this file itself will not be reloaded,
# so if you change any of the code inside the each_run block, you still need to
# restart the server.  In general, if you have non-trivial code in this file,
# it's advisable to move it into a separate file so you can easily edit it
# without restarting spork.  (For example, with RSpec, you could move
# non-trivial code into a file spec/support/my_helper.rb, making sure that the
# spec/support/* files are require'd from inside the each_run block.)
#
# Any code that is left outside the two blocks will be run during preforking
# *and* during each_run -- that's probably not what you want.
#
# These instructions should self-destruct in 10 seconds.  If they don't, feel
# free to delete them.




# This file is copied to spec/ when you run 'rails generate rspec:install'

