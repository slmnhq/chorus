desc 'Regenerate JSON fixtures for jasmine tests'
task :fixtures do
    script = File.expand_path("../../../script/test", __FILE__)
    exec "#{script} --tag fixture"
end
