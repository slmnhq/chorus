desc 'Regenerate JSON fixtures for jasmine tests'
task :fixtures do
  RSpec::Core::RakeTask.new(:generate_fixtures) do |t|
    options = ["--tag fixture"]
    options << "--tag ~database_integration" unless ENV['GPDB_HOST']
    t.rspec_opts = options
    t.pattern = 'spec/controllers/**/*_spec.rb'
  end
  Rake::Task[:generate_fixtures].invoke
end