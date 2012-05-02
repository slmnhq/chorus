require "json"

module FixtureGenerator
  def save_fixture(filename)
    path = File.join(Rails.root, "spec/javascripts/fixtures/", filename)
    File.open(path, 'w') do |f|
      f.write JSON.pretty_generate(decoded_response.as_json)
    end
  end
end
