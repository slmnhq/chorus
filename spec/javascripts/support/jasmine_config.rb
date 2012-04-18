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

    path = env['PATH_INFO']
    if path =~ /\.(png|gif|jpg)/ || path =~ /\/.*image/
      headers = {
          "Content-Type" => "image/jpeg"
      }
      [200, headers, []]
    elsif path =~ /\/file\/[^\/]+$/
      headers = {
          "Content-Type" => "text/plain"
      }
      [200, headers, []]
    else
      headers = {
          "Content-Type" => "application/json"
      }
      [200, headers, ["{}"]]
    end
  end
end

class TemplateMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    response_lines = []
    Dir.glob("public/templates/**/*.handlebars") do |file|
      template_name = file[("public/templates".length + 1)...(-(".handlebars".length))]
      this_response = [%{<script type="x-handlebars-template" data-template-path="#{template_name}">}]
      this_response << IO.read(file)
      this_response << %{</script>}
      response_lines << this_response.join()
    end
    [200, {"Content-Type" => "text/html"}, response_lines]
  end
end

class FixtureMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    response_lines = []
    Dir.glob("spec/javascripts/fixtures/**/*.json") do |file|
      fixture_name = file[("spec/javascripts/fixtures/".length)...(-(".json".length))]
      this_response = [%{<script type="application/json" data-fixture-path="#{fixture_name}">}]
      this_response << IO.read(file)
      this_response << %{</script>}
      response_lines << this_response.join()
    end
    [200, {"Content-Type" => "text/html"}, response_lines]
  end
end

module Jasmine
  def self.app(config)
    puts("Constructing custom Jasmine app from jasmine_config.rb")
    Rack::Builder.app do
      use Rack::Head
      use Rack::ETag, "max-age=0, private, must-revalidate"


      map('/run.html')         { run Jasmine::Redirect.new('/') }
      map('/__suite__')        { run Jasmine::FocusedSuite.new(config) }

      map('/__JASMINE_ROOT__') { run Rack::File.new(Jasmine::Core.path) }
      map(config.spec_path)    { run Rack::File.new(config.spec_dir) }
      map(config.root_path)    { run Rack::File.new(config.project_root) }

      map("/edc") do
        run DummyMiddleware.new(self)
      end

      map("/images") do
        run DummyMiddleware.new(self)
      end

      map("/__fixtures") do
        run FixtureMiddleware.new(self)
      end

      map("/__templates") do
        run TemplateMiddleware.new(self)
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
