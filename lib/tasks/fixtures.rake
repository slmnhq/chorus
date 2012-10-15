unless Rails.env.production?
  desc 'Regenerate JSON fixtures for jasmine tests'
  RSpec::Core::RakeTask.new(:fixtures) do |t|
    options = ["--tag fixture"]
    options << "--tag ~database_integration" unless ENV['GPDB_HOST']
    t.rspec_opts = options
    t.pattern = 'spec/controllers/**/*_spec.rb'
  end
end