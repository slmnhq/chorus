require 'capybara/rspec'
require 'capybara-webkit'
require 'capybara-screenshot'
require 'headless'
require 'database_cleaner'
require 'yaml'

headless = Headless.new
headless.start

ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../../config/environment", __FILE__)

Capybara.app = Rails.application
Capybara.default_driver = :webkit
Capybara.javascript_driver = :webkit
Capybara.automatic_reload = false
Capybara.run_server = true #Whether start server when testing
Capybara.server_port = 8200
Capybara.server_boot_timeout = 100
Capybara.save_and_open_page_path = ENV['WORKSPACE']

DatabaseCleaner.strategy = :transaction
DatabaseCleaner.clean_with :truncation
load "#{Rails.root}/db/seeds.rb"

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

RSpec.configure do |c|
  c.include Capybara::DSL
  c.include Capybara::RSpecMatchers

  c.include LoginHelpers
  c.include CleditorHelpers

  Capybara.default_wait_time = 60

  c.before(:each) do
    DatabaseCleaner.start
  end

  c.after(:each) do
    DatabaseCleaner.clean
  end
end
