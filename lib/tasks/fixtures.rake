desc 'Regenerate JSON fixtures for jasmine tests'
task :fixtures do
  spec_file_path = ARGV[1..-1].join(" ")
  script = File.expand_path("../../../script/ci-test", __FILE__)
  base = "#{script} --tag fixture --tag spec/controllers"
  if ENV['GPDB_HOST']
    exec base
  else
    exec(base + " --tag ~database_integration")
  end
end