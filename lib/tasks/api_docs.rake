unless Rails.env.production?
  namespace :api_docs do
    STDOUT.sync = true

    desc "Check for missing API docs"
    task :check => [:environment] do
      puts "Checking for missing API docs.."
      missing_docs = find_missing_docs
      if missing_docs
        puts missing_docs
        exit 1
      else
        puts 'No missing API Docs'
      end
    end

    desc "Build the API docs"
    RSpec::Core::RakeTask.new(:build) do |t|
      t.pattern = 'spec/api_docs/**/*_spec.rb'
      t.rspec_opts = ["--format RspecApiDocumentation::ApiFormatter"]
    end

    desc "Check and build API docs"
    task :generate => [:check, :build]

    desc "Package api docs"
    task :package => :build do
      destination_archive = File.expand_path(File.dirname(__FILE__) + '../../../doc/api_documentation.tar.gz')
      source_directory = File.expand_path(File.dirname(__FILE__) + '../../../public')
      `tar czf #{destination_archive} -C #{source_directory} api/`
    end
  end

  desc "Check and build API docs"
  task :api_docs => "api_docs:generate"


  class ::Route < Struct.new(:method, :path)
    include Comparable

    def to_s
      "#{method.upcase} #{path}"
    end

    def <=> other
      path <=> other.path
    end
  end

  def find_missing_docs
    Rails.application.reload_routes!
    all_routes = Rails.application.routes.routes

    require 'rails/application/route_inspector'
    inspector = Rails::Application::RouteInspector.new
    routes = inspector.collect_routes(all_routes)
    routes.reject! { |r| r[:verb].blank? }

    existing_routes = routes.collect do |r|
      ::Route.new(r[:verb].downcase, r[:path][/\/[^( ]+/])
    end

    existing_docs = `egrep -Rh "^\\W*(post|put|get|delete)" spec/api_docs`.split("\n").map { |line|
      match = line.match(/(\w+) +['"](\S+)['"]/)
      path = match[2]
      path.sub!(/\?.*/, '')
      match && ::Route.new(match[1].downcase, path)
    }.compact

    missing = existing_routes - existing_docs
    return false if missing.empty?

    <<-OUT
Missing docs
#{'=' * 20}
#{missing.sort.collect(&:to_s).join("\n")}
    OUT
  end
end