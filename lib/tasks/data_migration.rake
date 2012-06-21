desc 'Run the data migration tests'
task :data_migration do
  spec_file_path = ARGV[1..-1].join(" ")
  script = File.expand_path("../../../script/test", __FILE__)
  exec "#{script} spec/lib/data_migration --tag data_migration"
end