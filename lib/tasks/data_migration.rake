namespace :legacy_migration do
  task :default do
    spec_file_path = ARGV[1..-1].join(" ")
    script = File.expand_path("../../../script/test", __FILE__)
    Rake::Task["db:test:prepare"].invoke
    Rake::Task["db:test:prepare:legacy"].invoke
    exec "#{script} spec/lib/legacy_migration --tag legacy_migration"
  end

  desc 'Regenerate the cached Database refresh files'
  task :generate_refresh_cache => :environment do
    DatabaseMigrationRefreshExport.export
  end
end

desc 'Run the data migration tests'
task :legacy_migration do
  Rake::Task['legacy_migration:default'].invoke
end
