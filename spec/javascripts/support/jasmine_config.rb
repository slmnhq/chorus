module Jasmine
  class Config

    # Add your overrides or custom config code here

  end
end


# Note - this is necessary for rspec2, which has removed the backtrace
module Jasmine
  class SpecBuilder
    def declare_spec(parent, spec)
      me = self
      example_name = spec["name"]
      @spec_ids << spec["id"]
      backtrace = @example_locations[parent.description + " " + example_name]
      parent.it example_name, {} do
        me.report_spec(spec["id"])
      end
    end
  end
end

class DummyMiddleware
   def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)

    if request.path =~ /\/edc\/.*image/
      headers = {
          "Content-Type" => "image/jpeg"
      }
      [200, headers, []]
    elsif request.path =~ /\/file\/[^\/]+$/
      headers = {
          "Content-Type" => "text/plain"
      }
      [200, headers, []]
    else
      puts "delegating for #{request.path}"
      @app.call(env)
    end
  end
end

module Jasmine
  def self.app(config)
    puts("Constructing custom Jasmine app from jasmine_config.rb")
    Rack::Builder.app do
      use Rack::Head


      map('/run.html')         { run Jasmine::Redirect.new('/') }
      map('/__suite__')        { run Jasmine::FocusedSuite.new(config) }

      map('/__JASMINE_ROOT__') { run Rack::File.new(Jasmine::Core.path) }
      map(config.spec_path)    { run Rack::File.new(config.spec_dir) }
      map(config.root_path)    { run Rack::File.new(config.project_root) }

      map("/edc") do
        run DummyMiddleware.new(self)
      end

      map('/') do
        run Rack::Cascade.new([
          Rack::URLMap.new('/' => Rack::File.new(config.src_dir)),
          Jasmine::RunAdapter.new(config)
        ])
      end
    end
  end
end