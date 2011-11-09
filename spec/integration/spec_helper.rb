require 'capybara/rspec'
Capybara.default_driver = :selenium
Capybara.app_host = 'http://localhost:8080'

def current_route
  route = URI.parse(current_url).fragment
  route if route and not route.empty?
end

require File.join(File.dirname(__FILE__), 'helpers','login_helpers')

RSpec.configure do |c|
  c.include LoginHelpers
end