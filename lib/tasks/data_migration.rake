namespace :data_migration do
  task :default do
    spec_file_path = ARGV[1..-1].join(" ")
    script = File.expand_path("../../../script/test", __FILE__)
    Rake::Task["db:test:prepare"].invoke
    Rake::Task["db:test:prepare:legacy"].invoke
    exec "#{script} spec/lib/data_migration --tag data_migration"
  end

  desc 'Regenerate the cached Database refresh files'
  task :generate_refresh_cache => :environment do
    DatabaseMigrationRefreshExport.export
  end
end

desc 'Run the data migration tests'
task :data_migration do
  Rake::Task['data_migration:default'].invoke
end
