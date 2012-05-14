require "json"

module FixtureGenerator
  def save_fixture(filename, content=nil)
    content ||= decoded_response
    path = File.join(Rails.root, "spec/javascripts/fixtures/", filename)
    File.open(path, 'w') do |f|
      f.write JSON.pretty_generate(content.as_json)
    end
  end
end
