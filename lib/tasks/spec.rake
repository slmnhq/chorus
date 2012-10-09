desc 'Regenerate JSON fixtures for jasmine tests'
task :default => [:spec]

task :gpdb_host_check_stale do
  `echo "#{ENV['GPDB_HOST']}" > tmp/GPDB_HOST_STALE`
end

task :spec => [:gpdb_host_check_stale] do
  base = "ruby -S bundle exec rspec spec/controllers spec/permissions spec/models spec/lib spec/presenters spec/requests spec/services spec/install"
  if ENV['GPDB_HOST']
    exec base
  else
    warn "No Greenplum instance detected in environment variable 'GPDB_HOST'.  Skipping Greenplum integration tests.  See the project wiki for more information on running tests"
    exec(base + " --tag ~database_integration")
  end
end

task :all => [:gpdb_host_check_stale] do
  base = "ruby -S bundle exec rspec spec/controllers spec/permissions spec/models spec/lib spec/presenters spec/requests spec/services spec/install"
  unless ENV['GPDB_HOST']
    warn "No Greenplum instance detected in environment variable 'GPDB_HOST'.  Skipping Greenplum integration tests.  See the project wiki for more information on running tests"
    base += " --tag ~database_integration"
  end
  exec("#{base} && ruby -S bundle exec rspec spec/legacy_migration && rake api_docs")
end