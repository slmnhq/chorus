module Jasmine
  class Config
    def start_server(port = 8888)
      if defined? Rack::Server # Rack ~>1.0 compatibility
        server = Rack::Server.new(:Port => port, :AccessLog => [], :server => 'mizuno')
        server.instance_variable_set(:@app, Jasmine.app(self)) # workaround for Rack bug, when Rack > 1.2.1 is released Rack::Server.start(:app => Jasmine.app(self)) will work
        server.start
      else
        handler = Rack::Handler.get('webrick')
        handler.run(Jasmine.app(self), :Port => port, :AccessLog => [])
      end
    end
  end
end