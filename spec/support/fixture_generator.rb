require "json"

module FixtureGenerator
  def save_fixture(filename, content = response.decoded_body)
    path = Rails.root + "spec/javascripts/fixtures/rspec/" + filename
    path.dirname.mkdir unless path.dirname.directory?

    File.open(path, 'w') do |f|
      f.write JSON.pretty_generate(content.as_json)
    end
  end
end

class RSpec::Core::ExampleGroup
  def self.generate_fixture(file_path, &block)
    it "generates a JSON fixture", :fixture => true do
      instance_exec(&block)
      save_fixture file_path
    end
  end
end

