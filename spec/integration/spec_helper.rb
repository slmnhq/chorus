require 'capybara/rspec'
require 'capybara-screenshot'
require 'database_cleaner'
require 'yaml'

ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../../config/environment", __FILE__)

Capybara.app = Rails.application
Capybara.default_driver = :selenium
Capybara.run_server = true #Whether start server when testing
Capybara.server_port = 8200
Capybara.save_and_open_page_path = ENV['WORKSPACE']

DatabaseCleaner.strategy = :transaction
DatabaseCleaner.clean_with :truncation
load "#{Rails.root}/db/seeds.rb"

WEBPATH = YAML.load_file("spec/integration/webpath.yaml") unless defined? WEBPATH

def current_route
  route = URI.parse(current_url).fragment
  route if route and not route.empty?
end

Dir[File.join(File.dirname(__FILE__), 'helpers', "**", "*")].each {|f| require f}

RSpec.configure do |c|
  c.include Capybara::DSL
  c.include Capybara::RSpecMatchers

  c.include LoginHelpers
  c.include CleditorHelpers

  Capybara.default_wait_time = 5

  c.before(:each) do
    DatabaseCleaner.start
  end

  c.after(:each) do
    DatabaseCleaner.clean
  end
end
