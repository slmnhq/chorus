config = Rails.configuration.database_configuration[Rails.env]
username = config["username"]
password = config["password"]
port = config["port"]
database = config["database"]

ENV["QC_DATABASE_URL"] = "postgres://#{username}#{ ":" + password unless password.nil? }@localhost:#{port}/#{database}"