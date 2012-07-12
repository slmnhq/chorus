require "json"

module FixtureGenerator
  def save_fixture(filename, content = response.decoded_body)
    path = Rails.root + "spec/javascripts/fixtures/rspec/" + filename
    path.dirname.mkpath unless path.dirname.directory?

    File.open(path, 'w') do |f|
      f.write JSON.pretty_generate(content.as_json)
    end
  end
end

class RSpec::Core::ExampleGroup
  def self.generate_fixture(file_path, hash={}, &block)
    describe "JSON fixture generation", hash.merge(:fixture => true) do
      it "generates a fixture for #{file_path}" do
        instance_exec(&block)
        save_fixture file_path
      end
    end
  end
end

