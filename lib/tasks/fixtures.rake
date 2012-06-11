desc 'Regenerate JSON fixtures for jasmine tests'
task :fixtures do
  spec_file_path = ARGV[1..-1].join(" ")
  script = File.expand_path("../../../script/test", __FILE__)
  exec "#{script} --tag fixture #{spec_file_path}"
end
