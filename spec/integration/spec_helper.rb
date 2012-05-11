require 'capybara/rspec'
require 'capybara-screenshot'
require 'database_cleaner'

ENV["RAILS_ENV"] ||= 'test'
require File.expand_path("../../../config/environment", __FILE__)

Capybara.app = Rails.application
Capybara.default_driver = :selenium
Capybara.run_server = true #Whether start server when testing
Capybara.server_port = 8200
Capybara.save_and_open_page_path = ENV['CC_BUILD_ARTIFACTS'] || File.join(File.dirname(__FILE__), '..', '..', '..', '..', '..', 'rspec_failures')

DatabaseCleaner.strategy = :truncation
DatabaseCleaner.clean
load "#{Rails.root}/db/seeds.rb"

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

  Capybara.default_wait_time = 1
end
