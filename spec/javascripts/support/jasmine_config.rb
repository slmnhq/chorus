module Jasmine
  class Config

    def src_files
      Rails.application.assets["application"].dependencies.map do |asset|
        "assets/" + asset.logical_path
      end.push("public/help/Chorus_Help.js")
    end

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

class MessageMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    [200, {"Content-Type" => "text/html"}, [IO.read("public/messages/Messages_en.properties")]]
  end
end

class DummyMiddleware
  def initialize(app)
    @app = app
  end

  def call(env)
    path = env['PATH_INFO']

    fake_headers =
      case path
      when /\.js$/
        nil
      when /\/.*(image|thumbnail)/, /\.(png|gif|jpg)/
        { "Content-Type" => "image/jpeg" }
      when /fonts/
        { "Content-Type" => "application/octet-stream" }
      when /\/file\/[^\/]+$/
        { "Content-Type" => "text/plain" }
      when /\/edc\//
        { "Content-Type" => "application/json" }
      end

    if fake_headers
      [200, fake_headers, []]
    else
      @app.call(env)
    end
  end
end

module Jasmine
  def self.app(config)
    puts("Constructing custom Jasmine app from jasmine_config.rb")
    Rack::Builder.app do
      use Rack::Head
      use Rack::ETag, "max-age=0, private, must-revalidate"
      use DummyMiddleware

      map('/run.html')         { run Jasmine::Redirect.new('/') }
      map('/__suite__')        { run Jasmine::FocusedSuite.new(config) }

      map('/__JASMINE_ROOT__') { run Rack::File.new(Jasmine::Core.path) }
      map(config.spec_path)    { run Rack::File.new(config.spec_dir) }
      map(config.root_path)    { run Rack::File.new(config.project_root) }

      map('/assets') do
        run Rails.application.assets
      end

      map("/messages/Messages_en.properties") do
        run MessageMiddleware.new(self)
      end

      map("/__fixtures") do
        run FixtureMiddleware.new(self)
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
