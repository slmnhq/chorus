desc 'Regenerate JSON fixtures for jasmine tests'
task :default => [:spec]
task :spec do
  base = "ruby -S bundle exec rspec spec/controllers spec/permissions spec/models spec/lib spec/presenters spec/requests spec/services spec/install"
  if ENV['GPDB_HOST']
    exec base
  else
    puts "No Greenplum instance detected in environment variable 'GPDB_HOST'.  Skipping Greenplum integration tests.  See the project wiki for more information on running tests"
    exec(base + " --tag ~database_integration")
  end
end