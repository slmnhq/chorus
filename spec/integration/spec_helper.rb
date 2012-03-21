require 'capybara/rspec'
Capybara.default_driver = :selenium
Capybara.app_host = 'http://localhost:8080'

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

  Capybara.default_wait_time = 30
end