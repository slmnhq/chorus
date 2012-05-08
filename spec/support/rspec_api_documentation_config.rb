RspecApiDocumentation.configure do |config|
  config.docs_dir = Rails.root.join("public", "api")
  config.url_prefix = "api/"
  config.keep_source_order = true
end