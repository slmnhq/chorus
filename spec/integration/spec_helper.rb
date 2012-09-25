ENV["RAILS_ENV"] = 'integration'
require File.expand_path("../../../config/environment", __FILE__)

require 'rspec/rails'
require 'capybara/rspec'
require 'capybara-screenshot'
require 'headless'
require 'yaml'

headless = Headless.new
headless.start


Capybara.app = Rails.application
Capybara.default_driver = :selenium
Capybara.run_server = true #Whether start server when testing
Capybara.server_port = 8200
Capybara.server_boot_timeout = 100
Capybara.save_and_open_page_path = ENV['WORKSPACE']

WEBPATH = YAML.load_file("spec/integration/webpath.yaml") unless defined? WEBPATH

def current_route
  route = URI.parse(current_url).fragment
  route if route and not route.empty?
end

def wait_for_ajax(timeout = 10)
  page.wait_until(timeout) do
    page.evaluate_script 'jQuery.active == 0'
  end
end

Dir[File.join(File.dirname(__FILE__), 'helpers', "**", "*")].each {|f| require f}
Dir[File.join(File.dirname(__FILE__), 'support', "**", "*")].each {|f| require f}
require Rails.root.join('spec', 'factories.rb')
require "#{Rails.root}/spec/support/fixture_builder.rb"
require "#{Rails.root}/spec/support/database_integration/setup_gpdb.rb"

RSpec.configure do |config|
  config.mock_with :rr
  config.fixture_path = "#{Rails.root}/spec/fixtures"
  config.use_transactional_fixtures = true
  config.global_fixtures = :all
  config.include Capybara::DSL
  config.include Capybara::RSpecMatchers

  config.include LoginHelpers
  config.include CleditorHelpers
  config.include GpdbIntegration

  Capybara.default_wait_time = 5
end
