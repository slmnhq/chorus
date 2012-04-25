desc 'Run phantom against Jasmine for all specs, once'
task :phantom do
    `which phantomjs`
    raise "Could not find phantomjs on your path" unless $?.success?
    exec "phantomjs #{File.dirname(__FILE__)}/../../spec/run-phantom-jasmine.js #{ENV['filter']}"
end
