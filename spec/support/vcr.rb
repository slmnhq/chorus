require "vcr"

VCR.configure do |c|
  c.cassette_library_dir = 'spec/other_fixtures/vcr_cassettes'
  c.hook_into :fakeweb
  c.default_cassette_options = { :record => :new_episodes }

  c.filter_sensitive_data('<SUPPRESSED_KAGGLE_API_KEY>', :filter_kaggle_api_key) do |interaction|
    interaction.request.body
  end

end

def record_with_vcr(tape_name = nil, &block)
  default_tape_name = example.full_description.downcase.gsub(/[^\w\d]+/, '_')
  VCR.use_cassette(tape_name || default_tape_name, &block)
end
