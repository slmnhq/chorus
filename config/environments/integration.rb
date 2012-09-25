require_relative 'test'

Chorus::Application.configure do
  config.action_controller.perform_caching = true
  config.middleware.delete(::Rack::Sendfile)
end
