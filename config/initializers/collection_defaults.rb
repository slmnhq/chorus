Chorus::Application.configure do |config|
  config.config.collection_defaults = {
      :page => 1,
      :per_page => 50
  }
end