module Jasmine
  class Config
    def src_files
      Rails.application.assets["application"].dependencies.map do |asset|
        "assets/" + asset.logical_path
      end.push("public/help/Default.js")
    end
  end

  def self.runner_template
    File.read("spec/javascripts/support/old-jasmine-core/run.html.erb")
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
    jasmine_stylesheets = ::Jasmine::Core.css_files.map {|f| "/__JASMINE_ROOT__/#{f}"}
    config_shim = OpenStruct.new({:jasmine_files => ::Jasmine::Core.js_files.map {|f| "/__JASMINE_ROOT__/#{f}"},
                                  :js_files => config.js_files,
                                  :css_files => jasmine_stylesheets + (config.css_files || [])})
    page = Jasmine::Page.new(config_shim.instance_eval { binding })
    Rack::Builder.app do
      use Rack::Head
      use Rack::Jasmine::CacheControl
      use DummyMiddleware
      if Jasmine::Dependencies.rails_3_asset_pipeline?
        map('/assets') do
          run Rails.application.assets
        end
      end

      map('/run.html')         { run Rack::Jasmine::Redirect.new('/') }
      map('/__suite__')        { run Rack::Jasmine::FocusedSuite.new(config) }

      # map('/__JASMINE_ROOT__') { run Rack::File.new(Jasmine::Core.path) }
      map('/__JASMINE_ROOT__') { run Rack::File.new("spec/javascripts/support/old-jasmine-core") }

      map(config.spec_path)    { run Rack::File.new(config.spec_dir) }
      map(config.root_path)    { run Rack::File.new(config.project_root) }

      map("/messages/Messages_en.properties") do
        run MessageMiddleware.new(self)
      end

      map("/__fixtures") do
        run FixtureMiddleware.new(self)
      end

      map('/') do
        run Rack::Cascade.new([
          Rack::URLMap.new('/' => Rack::File.new(config.src_dir)),
          Rack::Jasmine::Runner.new(page)
        ])
      end
    end
  end
end

