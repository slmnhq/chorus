config = Rails.configuration.database_configuration[Rails.env]
username = config["username"]
password = config["password"]
port = config["port"]
database = config["database"]

ENV["QC_DATABASE_URL"] = "postgresql://localhost:#{port}/#{database}?username=#{username}#{password.nil? ? '' : "&password=#{password}"}"